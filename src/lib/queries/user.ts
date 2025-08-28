import "server-only"

import { cache } from "react"
import { unstable_noStore as noStore } from "next/cache"
import { cookies } from "next/headers"
import { pb, type PBUser, COLLECTIONS } from "@/lib/pocketbase"

/**
 * Get cached user from PocketBase server-side
 * Cache is used with a data-fetching function like fetch to share a data snapshot between components.
 * @see https://react.dev/reference/react/cache#reference
 */
export const getCachedUser = cache(async (): Promise<PBUser | null> => {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('pb_auth')
    
    if (!authCookie?.value) {
      return null
    }

    // Load auth data from cookie
    pb.authStore.loadFromCookie(authCookie.value)
    
    if (!pb.authStore.isValid) {
      return null
    }

    // Verify and refresh token if needed
    await pb.collection(COLLECTIONS.USERS).authRefresh()
    
    return pb.authStore.model as any as PBUser
  } catch (error) {
    console.error('Server-side auth check failed:', error)
    return null
  }
})

export async function getUserUsageMetrics(input: { userId: string }) {
  noStore()
  try {
    // Get user's store count
    const storesResult = await pb.collection(COLLECTIONS.STORES).getList(1, 1, {
      filter: `user = "${input.userId}"`
    })
    const storeCount = storesResult.totalItems

    // Get user's total product count across all stores
    let productCount = 0
    if (storeCount > 0) {
      const userStores = await pb.collection(COLLECTIONS.STORES).getFullList({
        filter: `user = "${input.userId}"`
      })
      
      for (const store of userStores) {
        const productsResult = await pb.collection(COLLECTIONS.PRODUCTS).getList(1, 1, {
          filter: `store = "${store.id}"`
        })
        productCount += productsResult.totalItems
      }
    }

    return {
      storeCount,
      productCount,
    }
  } catch (error) {
    console.error('Error fetching user usage metrics:', error)
    return {
      storeCount: 0,
      productCount: 0,
    }
  }
}

export async function getUserPlanMetrics(input: { userId: string }) {
  noStore()

  const fallback = {
    storeCount: 0,
    storeLimit: 0,
    productCount: 0,
    productLimit: 0,
    storeLimitExceeded: false,
    productLimitExceeded: false,
    subscriptionPlan: null,
  }

  try {
    const { storeCount, productCount } = await getUserUsageMetrics({
      userId: input.userId,
    })

    // Get user's primary store to check plan limits
    const userStores = await pb.collection(COLLECTIONS.STORES).getList(1, 1, {
      filter: `user = "${input.userId}"`,
      sort: '-created'
    })

    let storeLimit = 1 // free plan default
    let productLimit = 10 // free plan default
    let subscriptionPlan = 'free'

    if (userStores.items.length > 0) {
      const store = userStores.items[0] as any
      subscriptionPlan = store.plan || 'free'
      
      // Set limits based on plan
      switch (store.plan) {
        case 'standard':
          storeLimit = 3
          productLimit = 100
          break
        case 'pro':
          storeLimit = 10
          productLimit = 1000
          break
        default: // free
          storeLimit = 1
          productLimit = 10
      }
    }

    const storeLimitExceeded = storeCount >= storeLimit
    const productLimitExceeded = productCount >= productLimit

    return {
      storeCount,
      storeLimit,
      productCount,
      productLimit,
      storeLimitExceeded,
      productLimitExceeded,
      subscriptionPlan,
    }
  } catch (error) {
    console.error('Error fetching user plan metrics:', error)
    return fallback
  }
}
