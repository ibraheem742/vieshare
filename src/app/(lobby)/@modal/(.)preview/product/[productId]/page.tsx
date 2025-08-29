import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
// Remove unused import
import { EnterFullScreenIcon } from "@radix-ui/react-icons"

import { pb } from "@/lib/pocketbase"
import type { ProductWithRelations } from "@/lib/pocketbase"
import { cn, formatPrice } from "@/lib/utils"
import { AlertDialogAction } from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { buttonVariants } from "@/components/ui/button"
import { DialogShell } from "@/components/dialog-shell"
import { PlaceholderImage } from "@/components/placeholder-image"
import { Rating } from "@/components/rating"

interface ProductModalPageProps {
  params: Promise<{
    productId: string
  }>
}

export default async function ProductModalPage({
  params,
}: ProductModalPageProps) {
  const resolvedParams = await params
  const productId = decodeURIComponent(resolvedParams.productId)

  try {
    const product = await pb.collection('products').getOne<ProductWithRelations>(productId, {
      expand: 'category'
    })

    if (!product) {
      notFound()
    }

    const productData = {
      id: product.id,
      name: product.name,
      description: product.description,
      images: (Array.isArray(product.images) ? product.images : product.images ? [product.images] : []).map(url => ({ url, id: url, name: url })) || null,
      category: product.expand?.category?.name || "Unknown Category",
      price: parseFloat(product.price),
      inventory: product.inventory,
      rating: product.rating || 0,
    }

    return (
      <DialogShell className="flex flex-col gap-2 overflow-visible sm:flex-row">
        <AlertDialogAction
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "icon",
              className:
                "absolute right-10 top-4 h-auto w-auto shrink-0 rounded-sm bg-transparent p-0 text-foreground opacity-70 ring-offset-background transition-opacity hover:bg-transparent hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            })
          )}
          asChild
        >
          <Link href={`/product/${productData.id}`} replace>
            <EnterFullScreenIcon className="size-4" aria-hidden="true" />
          </Link>
        </AlertDialogAction>
        <AspectRatio ratio={16 / 9} className="w-full">
          {productData.images?.length ? (
            <Image
              src={productData.images[0]?.url ?? "/images/product-placeholder.webp"}
              alt={productData.images[0]?.name ?? productData.name}
              className="object-cover"
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
              fill
              loading="lazy"
            />
          ) : (
            <PlaceholderImage className="rounded-none" asChild />
          )}
        </AspectRatio>
        <div className="w-full space-y-6 p-6 sm:p-10">
          <div className="space-y-2">
            <h1 className="line-clamp-2 text-2xl font-bold">{productData.name}</h1>
            <p className="text-base text-muted-foreground">
              {formatPrice(productData.price)}
            </p>
            <Rating rating={Math.round(productData.rating / 5)} />
            <p className="text-base text-muted-foreground">
              {productData.inventory} in stock
            </p>
          </div>
          <p className="line-clamp-4 text-base text-muted-foreground">
            {productData.description}
          </p>
        </div>
      </DialogShell>
    )
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}
