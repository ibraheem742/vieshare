import * as React from "react"
import { type Metadata } from "next"
import { unstable_noStore as noStore } from "next/cache"
import { notFound } from "next/navigation"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"
import { pb, COLLECTIONS } from "@/lib/pocketbase"
import type { Product, ProductWithRelations } from "@/lib/pocketbase"
import type { ListResult } from "pocketbase"
import { getCategories } from "@/lib/queries/product"

import { storesProductsSearchParamsSchema } from "@/lib/validations/params"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DateRangePicker } from "@/components/date-range-picker"
import { ProductsTable } from "@/components/tables/products-table"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Products",
  description: "Manage your products",
}

interface ProductsPageProps {
  params: Promise<{
    storeId: string
  }>
  searchParams: Promise<SearchParams>
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])
  const storeId = decodeURIComponent(resolvedParams.storeId)

  // Parse search params using zod schema
  const { page, per_page, sort, name, category, from, to } =
    storesProductsSearchParamsSchema.parse(resolvedSearchParams)

  const store = await pb.collection(COLLECTIONS.STORES).getOne(storeId).catch(() => null)

  if (!store) {
    notFound()
  }

  const categoriesPromise = getCategories()

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

  const categoryIds = category?.split(".") ?? []

  const fromDay = from ? new Date(from) : undefined
  const toDay = to ? new Date(to) : undefined

  // PocketBase query for products
  const productsPromise = (async () => {
    noStore()
    try {
      let filter = `store = "${storeId}"`
      
      // Add name filter
      if (name) {
        filter += ` && name ~ "${name}"`
      }
      
      // Add category filter
      if (categoryIds.length > 0) {
        filter += ` && category in (${categoryIds.map(id => `"${id}"`).join(', ')})`
      }
      
      // Add date range filter
      if (fromDay && toDay) {
        filter += ` && created >= "${fromDay.toISOString()}" && created <= "${toDay.toISOString()}"`
      }
      
      const sortField = column === 'created' ? 'created' : column
      const sortOrder = order === 'asc' ? '+' : '-'
      
      const products: ListResult<ProductWithRelations> = await pb.collection(COLLECTIONS.PRODUCTS).getList<ProductWithRelations>(fallbackPage, limit, {
        filter,
        sort: `${sortOrder}${sortField || 'created'}`,
        expand: 'category,store'
      })
      
      return {
        data: products.items.map((product: ProductWithRelations) => ({
          id: product.id,
          name: product.name,
          category: product.category, // Use the relation field
          price: product.price,
          inventory: product.inventory,
          rating: product.rating,
          created: product.created
        })),
        pageCount: Math.ceil(products.totalItems / limit)
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
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <DateRangePicker align="end" />
      </div>
      <React.Suspense fallback={<DataTableSkeleton columnCount={6} />}>
        <ProductsTable promise={productsPromise} categoriesPromise={categoriesPromise} storeId={storeId} />
      </React.Suspense>
    </div>
  )
}
