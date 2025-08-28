import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { env } from "@/env.js"
import { pb, COLLECTIONS, type ProductWithRelations } from "@/lib/pocketbase"

import { formatPrice, toTitleCase } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product-card"
import { ProductImageCarousel } from "@/components/product-image-carousel"
import { Rating } from "@/components/rating"
import { Shell } from "@/components/shell"

import { AddToCartForm } from "./_components/add-to-cart-form"
import { UpdateProductRatingButton } from "./_components/update-product-rating-button"

interface ProductPageProps {
  params: Promise<{
    productId: string
  }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const productId = decodeURIComponent(resolvedParams.productId)

  const product = await pb.collection(COLLECTIONS.PRODUCTS).getOne(productId).catch(() => null)

  if (!product) {
    return {}
  }

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: toTitleCase(product.name),
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const productId = decodeURIComponent(resolvedParams.productId)

  const product = await pb.collection(COLLECTIONS.PRODUCTS).getOne(productId, {
    expand: 'category,store'
  }).catch(() => null)

  if (!product) {
    notFound()
  }

  const store = product?.expand?.store || null

  const otherProducts = store
    ? await pb.collection(COLLECTIONS.PRODUCTS).getList<ProductWithRelations>(1, 4, {
        filter: `store = "${product.store}" && id != "${productId}"`,
        sort: '-inventory',
        expand: 'category'
      }).then(result => result.items.map((item: ProductWithRelations) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : (item.images ? [item.images] : []),
        category: item.expand?.category?.name || null,
      }))).catch(() => [])
    : []

  const carouselImages = Array.isArray(product.images)
    ? (product.images as string[]).map((filename: string) => ({ id: filename, name: filename, url: pb.files.getURL(product, filename) }))
    : product.images
      ? [{ id: product.images as string, name: product.images as string, url: pb.files.getURL(product, product.images as string) }]
      : [];

  console.log("ProductImageCarousel images prop:", carouselImages);

  return (
    <Shell className="pb-12 md:pb-14">
      <div className="flex flex-col gap-8 md:flex-row md:gap-16">
        <ProductImageCarousel
          className="w-full md:w-1/2"
          images={carouselImages}
          options={{
            loop: true,
          }}
        />
        <Separator className="mt-4 md:hidden" />
        <div className="flex w-full flex-col gap-4 md:w-1/2">
          <div className="space-y-2">
            <h2 className="line-clamp-1 text-2xl font-bold">{product.name}</h2>
            <p className="text-base text-muted-foreground">
              {formatPrice(product.price)}
            </p>
            {store ? (
              <Link
                href={`/products?store_ids=${store.id}`}
                className="line-clamp-1 inline-block text-base text-muted-foreground hover:underline"
              >
                {store.name}
              </Link>
            ) : null}
          </div>
          <Separator className="my-1.5" />
          <p className="text-base text-muted-foreground">
            {product.inventory || 0} in stock
          </p>
          <div className="flex items-center justify-between">
            <Rating rating={Math.round((product.rating || 0) / 5)} />
            <UpdateProductRatingButton
              productId={product.id}
              rating={product.rating}
            />
          </div>
          <AddToCartForm 
            productId={productId}
            showBuyNow={true} 
          />
          <Separator className="mt-5" />
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="description"
          >
            <AccordionItem value="description" className="border-none">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                {product.description ??
                  "No description is available for this product."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator className="md:hidden" />
        </div>
      </div>
      {store && otherProducts.length > 0 ? (
        <div className="space-y-6 overflow-hidden">
          <h2 className="line-clamp-1 flex-1 text-2xl font-bold">
            More products from {store.name}
          </h2>
          <ScrollArea orientation="horizontal" className="pb-3.5">
            <div className="flex gap-4">
              {otherProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="min-w-[260px]"
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </Shell>
  )
}
