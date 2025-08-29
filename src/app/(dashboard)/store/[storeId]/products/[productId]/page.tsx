import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { env } from "@/env.js"
import { pb, COLLECTIONS } from "@/lib/pocketbase"
import type { Product } from "@/lib/pocketbase"
// Remove unused import

import { getCategories, getSubcategories } from "@/lib/queries/product"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { UpdateProductForm } from "./_components/update-product-form"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Manage Product",
  description: "Manage your product",
}

interface UpdateProductPageProps {
  params: Promise<{
    storeId: string
    productId: string
  }>
}

export default async function UpdateProductPage({
  params,
}: UpdateProductPageProps) {
  const resolvedParams = await params
  const storeId = decodeURIComponent(resolvedParams.storeId)
  const productId = decodeURIComponent(resolvedParams.productId)

  const product = await pb.collection(COLLECTIONS.PRODUCTS).getList<Product>(1, 1, {
    filter: `id = "${productId}" && store = "${storeId}"`
  }).then(result => result.items[0] || null).catch(() => null)

  if (!product) {
    notFound()
  }

  const promises = Promise.all([getCategories(), getSubcategories()]).then(
    ([categories, subcategories]) => ({ categories, subcategories })
  )

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle as="h2" className="text-2xl">
          Update product
        </CardTitle>
        <CardDescription>
          Update your product information, or delete it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateProductForm promises={promises} product={product} />
      </CardContent>
    </Card>
  )
}
