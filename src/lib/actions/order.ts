"use server"

import { unstable_noStore as noStore } from "next/cache"
import { cookies } from "next/headers"
import type { SearchParams } from "@/types"

import { pb, COLLECTIONS, type Order, type CartItem, type Address, type CheckoutItem, type Customer } from "@/lib/pocketbase"

export interface Sales { date: string; amount: number; }

// CheckoutItem is now imported from pocketbase.ts

export async function getOrders(input: SearchParams & { userId?: string }) {
  noStore()
  try {
    const page = Number(input.page) || 1
    const per_page = Number(input.per_page) || 10
    
    let filter = ''
    if (input.userId) {
      filter = `user = "${input.userId}"`
    }
    
    const records = await pb.collection(COLLECTIONS.ORDERS).getList<Order>(page, per_page, {
      filter,
      sort: '-created',
      expand: 'user,store,address'
    })
    
    return {
      data: records.items,
      pageCount: Math.ceil(records.totalItems / per_page),
    }
  } catch (err) {
    console.error('Error fetching orders:', err)
    return {
      data: [],
      pageCount: 0,
    }
  }
}

export async function getOrder(input: { id: string }): Promise<Order | null> {
  noStore()
  try {
    const record = await pb.collection('orders').getOne<Order>(input.id, {
      expand: 'user,store,address'
    })
    return record
  } catch (err) {
    console.error('Error fetching order:', err)
    return null
  }
}

export async function getOrderLineItems(input: { id: string }): Promise<CheckoutItem[]> {
  noStore()
  try {
    const order = await pb.collection(COLLECTIONS.ORDERS).getOne<Order>(input.id)
    return order.items || []
  } catch (err) {
    console.error('Error fetching order line items:', err)
    return []
  }
}

export async function getOrderCount(storeId: string): Promise<number> {
  noStore()
  try {
    const records = await pb.collection(COLLECTIONS.ORDERS).getList(1, 1, {
      filter: `store = "${storeId}"`,
    })
    return records.totalItems
  } catch (err) {
    console.error('Error fetching order count:', err)
    return 0
  }
}

export async function getSaleCount(storeId: string): Promise<number> {
  noStore()
  try {
    const records = await pb.collection(COLLECTIONS.ORDERS).getList(1, 1, {
      filter: `store = "${storeId}" && status != "cancelled"`,
    })
    return records.totalItems
  } catch (err) {
    console.error('Error fetching sale count:', err)
    return 0
  }
}

export async function getSales(storeId: string): Promise<{ date: string; amount: number }[]> {
  noStore()
  try {
    const records = await pb.collection(COLLECTIONS.ORDERS).getFullList<Order>({
      filter: `store = "${storeId}" && status != "cancelled"`,
      sort: '-created'
    })
    
    // Group by date and sum amounts
    const salesMap = new Map<string, number>()
    records.forEach(order => {
      const date = order.created.split('T')[0]! // Get YYYY-MM-DD part
      const amount = parseFloat(order.amount)
      salesMap.set(date, (salesMap.get(date) || 0) + amount)
    })
    
    return Array.from(salesMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }))
  } catch (err) {
    console.error('Error fetching sales:', err)
    return []
  }
}

export async function getCustomers(storeId: string): Promise<Customer[]> {
  noStore()
  try {
    const records = await pb.collection('customers').getFullList<Customer>({
      filter: `store = "${storeId}"`,
      sort: '-total_spent,-created'
    })
    return records
  } catch (err) {
    console.error('Error fetching customers:', err)
    return []
  }
}