import type { Metadata } from "next"
import { env } from "@/env.js"
import type { SearchParams } from "@/types"

import { getProducts } from "@/lib/queries/product"
import { toTitleCase } from "@/lib/utils"
import { AlertCard } from "@/components/alert-card"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Products } from "@/components/products"
import { Shell } from "@/components/shell"

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: toTitleCase(resolvedParams.category),
    description: `Buy products from the ${resolvedParams.category} category`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])
  const category = decodeURIComponent(resolvedParams.category)

  const productsTransaction = await getProducts(resolvedSearchParams)

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">{toTitleCase(category)}</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          {`Buy ${category} from the best stores`}
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
