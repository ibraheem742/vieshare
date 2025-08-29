// Legacy PocketBase file - replaced with Axios API
// This file is kept for type compatibility but should not be used

// Re-export types from new API for backward compatibility
export type { 
  User as PBUser,
  Category,
  Subcategory,
  Store,
  Product,
  ProductWithRelations,
  OrderWithRelations,
  StoreWithRelations,
  Cart,
  CartItem,
  Address,
  Order,
  Customer,
  Notification,
  BaseRecord,
  CheckoutItem,
  OrderStatus,
  AuthState
} from '@/lib/api/types'

// Legacy constants - kept for compatibility
export const COLLECTIONS = {
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

// Legacy pb object - deprecated, use API functions instead
export const pb = {
  authStore: {
    model: null,
    token: null,
    isValid: false,
    loadFromCookie: (cookie?: string) => {},
    clear: () => {},
    onChange: (callback: (token: string, model: any) => void) => () => {},
    save: () => {},
    exportToCookie: () => '',
  },
  collection: (name: string) => ({
    getList: <T = any>(...args: any[]) => Promise.resolve({ items: [] as T[], totalItems: 0, page: 1, perPage: 10, totalPages: 0 }),
    getOne: <T = any>(...args: any[]) => Promise.resolve({} as T),
    getFullList: <T = any>(...args: any[]) => Promise.resolve([] as T[]),
    create: <T = any>(...args: any[]) => Promise.resolve({} as T),
    update: <T = any>(...args: any[]) => Promise.resolve({} as T),
    delete: (...args: any[]) => Promise.resolve({}),
    subscribe: (...args: any[]) => Promise.resolve({}),
    unsubscribe: (...args: any[]) => Promise.resolve({}),
    authWithPassword: (...args: any[]) => Promise.resolve({ record: {}, token: '' }),
    requestVerification: (...args: any[]) => Promise.resolve({}),
    requestPasswordReset: (...args: any[]) => Promise.resolve({}),
    confirmPasswordReset: (...args: any[]) => Promise.resolve({}),
    confirmVerification: (...args: any[]) => Promise.resolve({}),
    authRefresh: (...args: any[]) => Promise.resolve({ record: {}, token: '' }),
  }),
  files: {
    getURL: (...args: any[]) => '',
  },
}

export default pb