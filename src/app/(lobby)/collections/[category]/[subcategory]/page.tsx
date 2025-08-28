import type { Metadata } from "next"
import { env } from "@/env.js"

import { getProducts } from "@/lib/queries/product"
import { getFeaturedStores } from "@/lib/queries/store"
import { toTitleCase, unslugify } from "@/lib/utils"
import { productsSearchParamsSchema } from "@/lib/validations/params"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Products } from "@/components/products"
import { Shell } from "@/components/shell"

interface SubcategoryPageProps {
  params: Promise<{
    category: string
    subcategory: string
  }>
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const subcategory = unslugify(resolvedParams.subcategory)

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: toTitleCase(subcategory),
    description: `Buy the best ${subcategory}`,
  }
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])
  const { category, subcategory } = resolvedParams
  const { page, per_page, sort, price_range, store_ids, store_page, active } =
    productsSearchParamsSchema.parse(resolvedSearchParams)

  // Products transaction
  const limit = typeof per_page === "string" ? parseInt(per_page) : 8
  const offset = typeof page === "string" ? (parseInt(page) - 1) * limit : 0

  const productsTransaction = await getProducts(resolvedSearchParams)

  // Stores transaction
  const storesLimit = 25
  const storesOffset =
    typeof store_page === "string"
      ? (parseInt(store_page) - 1) * storesLimit
      : 0

  const storesTransaction = await getFeaturedStores()

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">
          {toTitleCase(unslugify(subcategory))}
        </PageHeaderHeading>
        <PageHeaderDescription size="sm">
          {`Buy the best ${unslugify(subcategory)}`}
        </PageHeaderDescription>
      </PageHeader>
      {/* <Products
        products={productsTransaction.data}
        pageCount={productsTransaction.pageCount}
        stores={storesTransaction.data}
        storePageCount={storesTransaction.pageCount}
      /> */}
    </Shell>
  )
}
