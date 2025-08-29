// Main API exports
export { api } from '@/lib/axios'

// Types
export type * from './types'

// API modules
export { authApi, tokenManager } from './auth'
export { productsApi, categoriesApi } from './products'
export { storesApi } from './stores'
export { cartApi } from './cart'

// Helpers
export * from './helpers'

// Auth hook
export { AuthProvider, useAuth } from '@/lib/hooks/use-auth-axios'

// Constants for collections (similar to PocketBase COLLECTIONS)
export const API_COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  STORES: 'stores',
  PRODUCTS: 'products',
  CARTS: 'carts',
  CART_ITEMS: 'cart_items',
  ADDRESSES: 'addresses',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  NOTIFICATIONS: 'notifications',
} as const