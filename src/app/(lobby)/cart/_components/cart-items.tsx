"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { MinusIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons"

import { useCartSafe, useCartInitializer } from "@/lib/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"

export function CartItems() {
  const { items, updateItem, removeItem, getTotalPrice, clearCart, isLoading } = useCartSafe()
  
  // Initialize cart on mount
  useCartInitializer()

  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Icons.spinner className="size-6 animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Icons.cart className="size-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Your cart is empty</p>
          <Button asChild className="mt-4">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            <TrashIcon className="mr-2 size-4" />
            Clear Cart
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          {items.map((item) => {
            const product = item.expand?.product
            if (!product) return null
            
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                {product.images?.[0] && (
                  <div className="relative size-16 overflow-hidden rounded-md">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(product.price)}
                  </p>
                </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => updateItem(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1 || isLoading}
                >
                  <MinusIcon className="size-3" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10)
                    if (!isNaN(value) && value > 0) {
                      void updateItem(item.id, value)
                    }
                  }}
                  className="h-8 w-16 text-center"
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => updateItem(item.id, item.quantity + 1)}
                  disabled={isLoading}
                >
                  <PlusIcon className="size-3" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                  disabled={isLoading}
                >
                  <TrashIcon className="size-3" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            </div>
            )
          })}
        </div>
      </div>
      <div className="lg:w-80">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
          <Button className="mt-6 w-full" size="lg">
            Proceed to Checkout
          </Button>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}