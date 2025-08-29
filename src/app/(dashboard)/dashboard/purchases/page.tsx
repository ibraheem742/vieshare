import * as React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"

import { pb, COLLECTIONS } from "@/lib/pocketbase"
import type { OrderWithRelations } from "@/lib/pocketbase"
// import type { ListResult } from "pocketbase" // Removed PocketBase dependency
type ListResult<T> = { items: T[]; totalItems: number; page: number; perPage: number; totalPages: number; }
import { getCachedUser } from "@/lib/queries/user"
import { getUserEmail } from "@/lib/utils"
import { purchasesSearchParamsSchema } from "@/lib/validations/params"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"
import { PurchasesTable } from "@/components/tables/purchases-table"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Purchases",
  description: "Manage your purchases",
}
interface PurchasesPageProps {
  searchParams: Promise<SearchParams>
}

export default async function PurchasesPage({
  searchParams,
}: PurchasesPageProps) {
  const resolvedSearchParams = await searchParams
  const { page, per_page, sort, store, status } =
    purchasesSearchParamsSchema.parse(resolvedSearchParams)

  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  const email = getUserEmail(user)

  // Fallback page for invalid page numbers
  const fallbackPage = isNaN(page) || page < 1 ? 1 : page
  // Number of items per page
  const limit = isNaN(per_page) ? 10 : per_page
  // Number of items to skip (not used in PocketBase pagination)
  // const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0

  // Column and order to sort by
  const [column, order] = sort?.split(".") ?? ["created", "desc"]

  const statuses = status ? status.split(".") : []

  // Get orders from PocketBase
  const ordersPromise = (async () => {
    try {
      // Build filter conditions
      const filters: string[] = [`email = "${email}"`]
      
      if (typeof store === "string" && store.length > 0) {
        filters.push(`store.name ~ "${store}"`)
      }
      
      if (statuses.length > 0) {
        const statusFilter = statuses.map(s => `status = "${s}"`).join(" || ")
        filters.push(`(${statusFilter})`)
      }

      const filterString = filters.join(" && ")

      // Get orders with pagination
      const orders: ListResult<OrderWithRelations> = await pb.collection(COLLECTIONS.ORDERS).getList<OrderWithRelations>(fallbackPage, limit, {
        filter: filterString,
        sort: order === "asc" ? `+${column}` : `-${column}`,
        expand: 'store'
      })

      const data = orders.items.map((order) => {
        return {
          id: order.id,
          email: order.email,
          items: order.items,
          amount: order.amount,
          status: order.status,
          created: order.created,
          storeId: order.store,
          store: order.expand?.store?.name ?? "Unknown Store",
        }
      })

      return {
        data,
        pageCount: Math.ceil(orders.totalItems / limit),
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      return {
        data: [],
        pageCount: 0,
      }
    }
  })()

  return (
    <Shell variant="sidebar">
      <PageHeader>
        <PageHeaderHeading size="sm">Purchases</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Manage your purchases
        </PageHeaderDescription>
      </PageHeader>
      <React.Suspense fallback={<DataTableSkeleton columnCount={6} />}>
        <PurchasesTable promise={ordersPromise} />
      </React.Suspense>
    </Shell>
  )
}
