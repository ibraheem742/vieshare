import "server-only"

import {
  unstable_cache as cache,
  unstable_noStore as noStore,
} from "next/cache"
import type { SearchParams } from "@/types"

import { pb, COLLECTIONS, type Store, type Product, type Order, type Customer } from "@/lib/pocketbase"

export async function getFeaturedStores(): Promise<Store[]> {
  noStore()
  try {
    const records = await pb.collection(COLLECTIONS.STORES).getList<Store>(1, 8, {
      filter: 'active = true',
      sort: '-created',
      expand: 'user'
    })

    const storesWithProductCount = await Promise.all(
      records.items.map(async (store) => {
        const products = await pb.collection(COLLECTIONS.PRODUCTS).getList(1, 1, {
          filter: `store = "${store.id}"`,
        })
        return {
          ...store,
          productCount: products.totalItems,
        }
      })
    )

    return storesWithProductCount
  } catch (error) {
    console.error('Error fetching featured stores:', error)
    return []
  }
}

export async function getStores(input: { userId: string }): Promise<Store[]> {
  noStore()
  try {
    const records = await pb.collection('stores').getFullList<Store>({
      filter: `user = "${input.userId}"`,
      sort: '-created',
      expand: 'user'
    })
    return records
  } catch (err) {
    console.error('Error fetching user stores:', err)
    return []
  }
}

export async function getStore(input: { id: string }): Promise<Store | null> {
  noStore()
  try {
    const record = await pb.collection('stores').getOne<Store>(input.id, {
      expand: 'user'
    })
    return record
  } catch (err) {
    console.error('Error fetching store:', err)
    return null
  }
}

export async function getStoreOrders(input: { storeId: string } & SearchParams) {
  noStore()
  try {
    const page = Number(input.page) || 1
    const per_page = Number(input.per_page) || 10
    
    const records = await pb.collection('orders').getList<Order>(page, per_page, {
      filter: `store = "${input.storeId}"`,
      sort: '-created',
      expand: 'user,address'
    })
    
    return {
      data: records.items,
      pageCount: Math.ceil(records.totalItems / per_page),
    }
  } catch (err) {
    console.error('Error fetching store orders:', err)
    return {
      data: [],
      pageCount: 0,
    }
  }
}

export async function getStoreProducts(input: { storeId: string } & SearchParams) {
  noStore()
  try {
    const page = Number(input.page) || 1
    const per_page = Number(input.per_page) || 10
    
    const records = await pb.collection('products').getList<Product>(page, per_page, {
      filter: `store = "${input.storeId}"`,
      sort: '-created',
      expand: 'category,subcategory'
    })
    
    return {
      data: records.items,
      pageCount: Math.ceil(records.totalItems / per_page),
    }
  } catch (err) {
    console.error('Error fetching store products:', err)
    return {
      data: [],
      pageCount: 0,
    }
  }
}

export async function getStoreCustomers(input: { storeId: string } & SearchParams) {
  noStore()
  try {
    const page = Number(input.page) || 1
    const per_page = Number(input.per_page) || 10
    
    const records = await pb.collection('customers').getList<Customer>(page, per_page, {
      filter: `store = "${input.storeId}"`,
      sort: '-total_spent,-created'
    })
    
    return {
      data: records.items,
      pageCount: Math.ceil(records.totalItems / per_page),
    }
  } catch (err) {
    console.error('Error fetching store customers:', err)
    return {
      data: [],
      pageCount: 0,
    }
  }
}

export async function getStoresByUserId(input: { userId: string }): Promise<Store[]> {
  noStore()
  try {
    const records = await pb.collection(COLLECTIONS.STORES).getFullList<Store>({
      filter: `user = "${input.userId}"`,
      sort: '-created',
      expand: 'user'
    })
    return records
  } catch (err) {
    console.error('Error fetching user stores:', err)
    return []
  }
}

export async function getStoreByUserId(userId: string): Promise<Store | null> {
  noStore()
  try {
    const records = await pb.collection('stores').getList<Store>(1, 1, {
      filter: `user = "${userId}"`,
      sort: '-created',
      expand: 'user'
    })
    return records.items[0] || null
  } catch (err) {
    console.error('Error fetching user store:', err)
    return null
  }
}