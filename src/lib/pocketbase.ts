import PocketBase from "pocketbase"
import { env } from "@/env"

export const pb = new PocketBase(env.NEXT_PUBLIC_POCKETBASE_URL)

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false)

// Base PocketBase record interface
export interface BaseRecord {
  id: string
  created: string
  updated: string
  collectionId: string
  collectionName: string
}

// PocketBase user interface (built-in auth)
export interface PBUser extends BaseRecord {
  email: string
  emailVisibility: boolean
  username: string
  verified: boolean
  name?: string
  avatar?: string
}

// Auth state interface
export interface AuthState {
  user: PBUser | null
  token: string | null
  isLoading: boolean
}

// Collection types based on schema
export interface Category extends BaseRecord {
  name: string
  slug: string
  description?: string
  image?: string
}

export interface Subcategory extends BaseRecord {
  name: string
  slug: string
  description?: string
  category: string // relation to Category
}

export interface Store extends BaseRecord {
  name: string
  slug: string
  description?: string
  user: string // relation to PBUser
  plan: 'free' | 'standard' | 'pro'
  plan_ends_at?: string
  cancel_plan_at_end: boolean
  product_limit: number
  tag_limit: number
  variant_limit: number
  active: boolean // Store active status
}

export interface Product extends BaseRecord {
  name: string
  description?: string
  images?: string | string[] // file array or single file
  category: string // relation to Category
  subcategory?: string // relation to Subcategory
  price: string // decimal as string for precision
  inventory: number
  rating: number
  store: string // relation to Store
  active: boolean
}

export interface Cart extends BaseRecord {
  user?: string // relation to PBUser, optional for guest carts
  session_id?: string // for guest cart tracking
}

export interface CartItem extends BaseRecord {
  cart: string // relation to Cart
  product: string // relation to Product
  quantity: number
  subcategory?: string // relation to Subcategory
}

export interface Address extends BaseRecord {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  user: string // relation to PBUser
}

export interface Order extends BaseRecord {
  user?: string // relation to PBUser, optional for guest orders
  store: string // relation to Store
  items: CheckoutItem[] // JSON array of order items
  quantity?: number
  amount: string // decimal as string
  status: OrderStatus
  name: string // customer name
  email: string // customer email
  address: string // relation to Address
}

export interface Customer extends BaseRecord {
  name?: string
  email: string
  store: string // relation to Store
  total_orders: number
  total_spent: string // decimal as string
}

export interface Notification extends BaseRecord {
  email: string
  token: string
  user?: string // relation to PBUser
  communication: boolean
  newsletter: boolean
  marketing: boolean
}

// Order related types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface CheckoutItem {
  productId: string
  name: string
  price: string
  quantity: number
  subcategory?: string
}

// Response types with expanded relations
export interface ProductWithRelations extends Product {
  expand?: {
    category?: Category
    subcategory?: Subcategory
    store?: Store
  }
}

export interface OrderWithRelations extends Order {
  expand?: {
    user?: PBUser
    store?: Store
    address?: Address
  }
}

export interface StoreWithRelations extends Store {
  expand?: {
    user?: PBUser
  }
}

// Collection names as constants
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

export default pb