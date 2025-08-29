import { authApi } from './auth'
import { productsApi, categoriesApi } from './products'
import { storesApi } from './stores'
import { cartApi } from './cart'
import { User } from './types'

// Auth helpers
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await authApi.getCurrentUser()
    return user
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

export async function signInWithPassword(email: string, password: string): Promise<User> {
  const authData = await authApi.signIn({ email, password })
  return authData.user
}

export async function signUpWithEmailPassword(data: {
  email: string
  password: string
  username: string
  name?: string
}): Promise<User> {
  const authData = await authApi.signUp(data)
  return authData.user
}

export function signOut(): void {
  void authApi.signOut()
}

// Collection helpers with proper typing (similar to pbCollections but for axios)
export const apiCollections = {
  users: () => authApi,
  categories: () => categoriesApi,
  subcategories: () => ({ getSubcategories: categoriesApi.getSubcategories }),
  stores: () => storesApi,
  products: () => productsApi,
  carts: () => cartApi,
  cartItems: () => cartApi,
  // Add more as needed
}

// Error handling helpers
export function isApiError(error: any): error is { response: { status: number; data: { message: string } } } {
  return error && error.response && typeof error.response.status === 'number'
}

export function getApiErrorMessage(error: any): string {
  if (isApiError(error)) {
    return error.response.data?.message || 'An error occurred'
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Filter builders (similar to PocketBase but adapted for API queries)
export function buildUserFilter(userId: string): string {
  return `user="${userId}"`
}

export function buildStoreFilter(storeId: string): string {
  return `store="${storeId}"`
}

export function buildActiveFilter(active: boolean = true): string {
  return `active=${active}`
}

export function combineFilters(...filters: (string | undefined)[]): string {
  return filters.filter(Boolean).join(' && ')
}

// File URL helpers (for images stored via PocketBase file system)
export function getFileUrl(record: any, filename: string, thumb?: string): string {
  // Construct PocketBase file URL
  const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pocketbase.vietopik.com'
  let url = `${baseUrl}/api/files/${record.collectionName || record.collectionId}/${record.id}/${filename}`
  
  if (thumb) {
    url += `?thumb=${thumb}`
  }
  
  return url
}

export function getImageUrls(record: any, images: string[]): string[] {
  return images.map(img => getFileUrl(record, img))
}

// Utility functions for data transformation
export function transformPocketBaseRecord<T>(record: any): T {
  // Transform PocketBase record to our API types
  const transformed = { ...record }
  
  // Map PocketBase fields to our field names (keep both for compatibility)
  if (record.created) {
    transformed.createdAt = record.created
    transformed.created = record.created
  }
  if (record.updated) {
    transformed.updatedAt = record.updated
    transformed.updated = record.updated
  }
  
  // Handle relation fields that might have different naming (keep both formats)
  if (record.user) {
    transformed.userId = record.user
    transformed.user = record.user
  }
  if (record.store) {
    transformed.storeId = record.store
    transformed.store = record.store
  }
  if (record.category) {
    transformed.categoryId = record.category
    transformed.category = record.category
  }
  if (record.subcategory) {
    transformed.subcategoryId = record.subcategory
    transformed.subcategory = record.subcategory
  }
  if (record.product) {
    transformed.productId = record.product
    transformed.product = record.product
  }
  if (record.cart) {
    transformed.cartId = record.cart
    transformed.cart = record.cart
  }
  
  return transformed as T
}

// Real-time subscriptions placeholder (would need WebSocket implementation)
export function subscribeToCollection(
  collection: string,
  callback: (data: any) => void,
  filter?: string
) {
  // This would need WebSocket or Server-Sent Events implementation
  console.warn('Real-time subscriptions not implemented yet')
  return () => {} // Return unsubscribe function
}

export function unsubscribeFromCollection(collection: string) {
  // Placeholder for unsubscribe functionality
  console.warn('Real-time subscriptions not implemented yet')
}