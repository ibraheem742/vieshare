import 'server-only'
import axios from 'axios'
import { cookies } from 'next/headers'
import { env } from '@/env'

// Server-side API instance with cookie-based auth
export const createServerApi = async () => {
  const instance = axios.create({
    baseURL: `${env.NEXT_PUBLIC_POCKETBASE_URL}/api`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Get auth token from cookies
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth_token')
    
    if (authCookie?.value) {
      instance.defaults.headers.Authorization = `Bearer ${authCookie.value}`
    }
  } catch (error) {
    console.warn('Could not access cookies in server API:', error)
  }

  return instance
}

// Server-side stores API
export const serverStoresApi = {
  getUserStores: async (userId: string) => {
    try {
      const api = await createServerApi()
      const response = await api.get('/collections/stores/records', {
        params: {
          filter: `user = "${userId}"`,
          expand: 'user'
        }
      })
      
      console.log('Server API response for stores:', {
        status: response.status,
        data: response.data,
        itemsLength: response.data.items?.length || 0
      })
      
      const stores = response.data.items || []
      console.log('Processed stores:', stores.map((s: any) => ({ id: s.id, name: s.name })))
      
      return stores
    } catch (error) {
      console.error('Error fetching user stores on server:', error)
      return []
    }
  },

  getStore: async (storeId: string) => {
    try {
      const api = await createServerApi()
      const response = await api.get(`/collections/stores/records/${storeId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching store on server:', error)
      return null
    }
  },

  getStoreProducts: async (storeId: string, page = 1, perPage = 10, filters: any = {}) => {
    try {
      const api = await createServerApi()
      
      let filter = `store = "${storeId}"`
      
      // Add filters
      if (filters.name) {
        filter += ` && name ~ "${filters.name}"`
      }
      
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        filter += ` && category in (${filters.categoryIds.map((id: string) => `"${id}"`).join(', ')})`
      }
      
      if (filters.fromDay && filters.toDay) {
        filter += ` && created >= "${filters.fromDay}" && created <= "${filters.toDay}"`
      }

      const sort = filters.sort || '-created'
      
      const response = await api.get('/collections/products/records', {
        params: {
          page,
          perPage,
          filter,
          sort,
          expand: 'category,store'
        }
      })
      
      console.log('Server API response for products:', {
        status: response.status,
        storeId,
        itemsLength: response.data.items?.length || 0,
        totalItems: response.data.totalItems
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching store products on server:', error)
      return { items: [], totalItems: 0, page: 1, perPage: 10, totalPages: 0 }
    }
  },
}