import { pb, COLLECTIONS, type PBUser } from "@/lib/pocketbase"
import { getFileUrl as apiGetFileUrl } from "@/lib/api/helpers"

/**
 * Helper functions for common PocketBase operations
 */

// Auth helpers
export async function getCurrentUser(): Promise<PBUser | null> {
  if (!pb.authStore.isValid) return null
  
  try {
    await pb.collection(COLLECTIONS.USERS).authRefresh()
    return pb.authStore.model as any as PBUser
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

export async function signInWithPassword(email: string, password: string): Promise<PBUser> {
  const authData = await pb.collection(COLLECTIONS.USERS).authWithPassword(email, password)
  return authData.record as any as PBUser
}

export async function signUpWithEmailPassword(data: {
  email: string
  password: string
  username: string
  name?: string
}): Promise<PBUser> {
  const userData = {
    email: data.email,
    password: data.password,
    passwordConfirm: data.password,
    username: data.username,
    name: data.name || data.username,
    emailVisibility: false
  }

  const createdUser = await pb.collection(COLLECTIONS.USERS).create(userData)
  
  // Send verification email
  await pb.collection(COLLECTIONS.USERS).requestVerification(data.email)
  
  // Auto sign in after registration
  const authData = await pb.collection(COLLECTIONS.USERS).authWithPassword(data.email, data.password)
  return authData.record as any as PBUser
}

export function signOut(): void {
  pb.authStore.clear()
}

// Collection helpers with proper typing
export const pbCollections = {
  users: () => pb.collection(COLLECTIONS.USERS),
  categories: () => pb.collection(COLLECTIONS.CATEGORIES),
  subcategories: () => pb.collection(COLLECTIONS.SUBCATEGORIES),
  stores: () => pb.collection(COLLECTIONS.STORES),
  products: () => pb.collection(COLLECTIONS.PRODUCTS),
  carts: () => pb.collection(COLLECTIONS.CARTS),
  cartItems: () => pb.collection(COLLECTIONS.CART_ITEMS),
  addresses: () => pb.collection(COLLECTIONS.ADDRESSES),
  orders: () => pb.collection(COLLECTIONS.ORDERS),
  customers: () => pb.collection(COLLECTIONS.CUSTOMERS),
  notifications: () => pb.collection(COLLECTIONS.NOTIFICATIONS),
} as const

// Error handling helpers
export function isPBError(error: any): error is { status: number; message: string; data?: any } {
  return error && typeof error.status === 'number' && typeof error.message === 'string'
}

export function getPBErrorMessage(error: any): string {
  if (isPBError(error)) {
    return error.message || 'An error occurred'
  }
  return 'An unexpected error occurred'
}

// Filter builders
export function buildUserFilter(userId: string): string {
  return `user = "${userId}"`
}

export function buildStoreFilter(storeId: string): string {
  return `store = "${storeId}"`
}

export function buildActiveFilter(active: boolean = true): string {
  return `active = ${active}`
}

export function combineFilters(...filters: (string | undefined)[]): string {
  return filters.filter(Boolean).join(' && ')
}

// File upload helpers - use the working implementation from API helpers
export function getFileUrl(record: any, filename: string, thumb?: string): string {
  return apiGetFileUrl(record, filename, thumb)
}

export function getImageUrls(record: any, images: string[]): string[] {
  return images.map(img => apiGetFileUrl(record, img))
}

// Real-time subscriptions
export function subscribeToCollection(
  collection: string,
  callback: (data: any) => void,
  filter?: string
) {
  return pb.collection(collection).subscribe('*', callback, { filter })
}

export function unsubscribeFromCollection(collection: string) {
  void pb.collection(collection).unsubscribe()
}