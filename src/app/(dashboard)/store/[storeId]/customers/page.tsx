import * as React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"
import { pb, COLLECTIONS } from "@/lib/pocketbase"
import type { OrderWithRelations, Customer } from "@/lib/pocketbase"
import type { RecordModel } from "pocketbase"

import { customersSearchParamsSchema } from "@/lib/validations/params"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { CustomersTable } from "@/components/tables/customers-table"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Customers",
  description: "Customers for your store",
}

interface CustomersPageProps {
  params: Promise<{
    storeId: string
  }>
  searchParams: Promise<SearchParams>
}

export default async function CustomersPage({
  params,
  searchParams,
}: CustomersPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])
  const storeId = decodeURIComponent(resolvedParams.storeId)

  const { page, per_page, sort, email, from, to } =
    customersSearchParamsSchema.parse(resolvedSearchParams)

  const store = await pb.collection(COLLECTIONS.STORES).getOne(storeId).catch(() => null)

  if (!store) {
    notFound()
  }

  // Transaction is used to ensure both queries are executed in a single transaction
  const fallbackPage = isNaN(page) || page < 1 ? 1 : page
  // Number of items per page
  const limit = isNaN(per_page) ? 10 : per_page
  // Number of items to skip
  const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0

  const fromDay = from ? new Date(from) : undefined
  const toDay = to ? new Date(to) : undefined

  const ordersPromise = (async () => {
    try {
      let filter = `store = "${storeId}"`
      
      // Add email filter
      if (email) {
        filter += ` && email ~ "${email}"`
      }
      
      // Add date range filter
      if (fromDay && toDay) {
        filter += ` && created >= "${fromDay.toISOString()}" && created <= "${toDay.toISOString()}"`
      }
      
      // Get all orders for this store with filters
      const orders = await pb.collection(COLLECTIONS.ORDERS).getFullList<OrderWithRelations>({
        filter,
        expand: 'store'
      })
      
      interface CustomerData {
        name: string;
        email: string;
        orderPlaced: number;
        totalSpent: number;
        created: string;
      }

      // Group orders by customer email
      const customerMap = new Map<string, CustomerData>()
      
      orders.forEach((order: OrderWithRelations) => {
        const customerEmail = order.email
        if (!customerMap.has(customerEmail)) {
          customerMap.set(customerEmail, {
            name: order.name || 'N/A',
            email: customerEmail,
            orderPlaced: 0,
            totalSpent: 0,
            created: order.created
          })
        }
        
        const customer = customerMap.get(customerEmail)!
        customer.orderPlaced += 1
        customer.totalSpent += Number(order.amount || 0)
        
        // Keep track of earliest order date
        if (order.created < customer.created) {
          customer.created = order.created
        }
      })
      
      // Convert to array and sort
      let data: CustomerData[] = Array.from(customerMap.values())
      
      // Apply sorting
      if (sort === 'name.asc') {
        data.sort((a, b) => a.name.localeCompare(b.name))
      } else if (sort === 'name.desc') {
        data.sort((a, b) => b.name.localeCompare(a.name))
      } else if (sort === 'email.asc') {
        data.sort((a, b) => a.email.localeCompare(b.email))
      } else if (sort === 'email.desc') {
        data.sort((a, b) => b.email.localeCompare(a.email))
      } else if (sort === 'totalSpent.asc') {
        data.sort((a, b) => a.totalSpent - b.totalSpent)
      } else if (sort === 'totalSpent.desc') {
        data.sort((a, b) => b.totalSpent - a.totalSpent)
      } else if (sort === 'orderPlaced.asc') {
        data.sort((a, b) => a.orderPlaced - b.orderPlaced)
      } else if (sort === 'orderPlaced.desc') {
        data.sort((a, b) => b.orderPlaced - a.orderPlaced)
      } else if (sort === 'created.asc') {
        data.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
      } else {
        data.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      }
      
      // Apply pagination
      const totalCount = data.length
      const pageCount = Math.ceil(totalCount / limit)
      const startIndex = offset
      const endIndex = startIndex + limit
      
      data = data.slice(startIndex, endIndex)
      
      return {
        data,
        pageCount
      }
    } catch (err) {
      console.error(err)
      return {
        data: [],
        pageCount: 0
      }
    }
  })()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <DateRangePicker align="end" />
      </div>
      <React.Suspense
        fallback={
          <DataTableSkeleton columnCount={5} filterableColumnCount={0} />
        }
      >
        <CustomersTable promise={ordersPromise} storeId={store.id} />
      </React.Suspense>
    </div>
  )
}
