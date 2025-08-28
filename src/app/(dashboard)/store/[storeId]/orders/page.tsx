import * as React from "react"
import type { Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import { notFound } from "next/navigation"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"
import { pb, COLLECTIONS } from "@/lib/pocketbase"
import type { OrderWithRelations } from "@/lib/pocketbase"
import type { ListResult } from "pocketbase"

import { ordersSearchParamsSchema } from "@/lib/validations/params"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { OrdersTable } from "@/components/tables/orders-table"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Orders",
  description: "Manage your orders",
}

interface OrdersPageProps {
  params: Promise<{
    storeId: string
  }>
  searchParams: Promise<SearchParams>
}

export default async function OrdersPage({
  params,
  searchParams,
}: OrdersPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])
  const storeId = decodeURIComponent(resolvedParams.storeId)

  const { page, per_page, sort, customer, status, from, to } =
    ordersSearchParamsSchema.parse(resolvedSearchParams)

  const store = await pb.collection(COLLECTIONS.STORES).getOne(storeId).catch(() => null)

  if (!store) {
    notFound()
  }

  // Fallback page for invalid page numbers

  const fallbackPage = isNaN(page) || page < 1 ? 1 : page
  // Number of items per page
  const limit = isNaN(per_page) ? 10 : per_page
  // Number of items to skip
  const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0
  // Column and order to sort by
  const [column, order] = (sort?.split(".") as [
    string | undefined,
    "asc" | "desc" | undefined,
  ]) ?? ["created", "desc"]

  const statuses = status ? status.split(".") : []

  const fromDay = from ? new Date(from) : undefined
  const toDay = to ? new Date(to) : undefined

  // PocketBase query for orders
  noStore()
  const ordersPromise = (async () => {
    try {
      let filter = `store = "${storeId}"`
      
      // Add customer email filter
      if (customer) {
        filter += ` && email ~ "${customer}"`
      }
      
      // Add status filter
      if (statuses.length > 0) {
        filter += ` && status in (${statuses.map(s => `"${s}"`).join(', ')})`
      }
      
      // Add date range filter
      if (fromDay && toDay) {
        filter += ` && created >= "${fromDay.toISOString()}" && created <= "${toDay.toISOString()}"`
      }
      
      const sortField = column === 'created' ? 'created' : column
      const sortOrder = order === 'asc' ? '+' : '-'
      
      const orders: ListResult<OrderWithRelations> = await pb.collection(COLLECTIONS.ORDERS).getList<OrderWithRelations>(fallbackPage, limit, {
        filter,
        sort: `${sortOrder}${sortField || 'created'}`,
        expand: 'store'
      })
      
      return {
        data: orders.items.map((order: OrderWithRelations) => ({
          id: order.id,
          storeId: order.store,
          quantity: order.quantity,
          amount: order.amount,
          paymentIntentId: order.id, // Use order id since we removed Stripe
          status: order.status,
          customer: order.email,
          created: order.created
        })),
        pageCount: Math.ceil(orders.totalItems / limit)
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
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <DateRangePicker align="end" />
      </div>
      <React.Suspense fallback={<DataTableSkeleton columnCount={6} />}>
        <OrdersTable promise={ordersPromise} storeId={storeId} />
      </React.Suspense>
    </div>
  )
}
