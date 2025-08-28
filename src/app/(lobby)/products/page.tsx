import { type Metadata } from "next"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"

import { getProducts } from "@/lib/queries/product"
import { AlertCard } from "@/components/alert-card"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Products } from "@/components/products"
import { Shell } from "@/components/shell"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Products",
  description: "Buy products from our stores",
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = await searchParams
  
  console.log('ProductsPage: Fetching products with params:', resolvedSearchParams)
  const productsTransaction = await getProducts(resolvedSearchParams)
  console.log('ProductsPage: Products found:', productsTransaction.data.length)

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">Products</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Buy products from our stores
        </PageHeaderDescription>
      </PageHeader>
      <Products 
        products={productsTransaction.data}
        pageCount={productsTransaction.pageCount}
      />
      <AlertCard />
    </Shell>
  )
}
