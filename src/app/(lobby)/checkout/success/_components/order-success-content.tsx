"use client"

import * as React from "react"
import Link from "next/link"
import { CheckIcon } from "@radix-ui/react-icons"

import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"

interface OrderData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  notes?: string
  items: Array<{
    id: string
    quantity: number
    expand?: {
      product?: {
        id: string
        name: string
        price: string
      }
    }
  }>
  total: number
  orderId: string
  createdAt: string
}

export function OrderSuccessContent() {
  const [orderData, setOrderData] = React.useState<OrderData | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    
    // Get order data from sessionStorage
    const storedOrder = sessionStorage.getItem('completedOrder')
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder) as OrderData
        setOrderData(parsedOrder)
        // Clear the stored order data
        sessionStorage.removeItem('completedOrder')
      } catch (error) {
        console.error('Error parsing order data:', error)
      }
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Icons.spinner className="size-6 animate-spin" />
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">No order found</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckIcon className="size-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>
        </div>
      </div>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>
            Order #{orderData.orderId} • Placed on{" "}
            {new Date(orderData.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3">Items Ordered</h3>
            <div className="space-y-3">
              {orderData.items.map((item) => {
                const product = item.expand?.product
                if (!product) return null
                
                return (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatPrice(product.price)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice((parseFloat(product.price) * item.quantity).toString())}
                    </p>
                  </div>
                )
              })}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(orderData.total)}</span>
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <h3 className="font-semibold mb-3">Shipping Information</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{orderData.name}</p>
              <p>{orderData.email}</p>
              <p>{orderData.phone}</p>
              <p>{orderData.address}</p>
              <p>
                {orderData.city}, {orderData.state} {orderData.postalCode}
              </p>
              <p>{orderData.country}</p>
              {orderData.notes && (
                <div className="mt-3">
                  <p className="font-medium">Order Notes:</p>
                  <p className="text-muted-foreground">{orderData.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What&apos;s Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex size-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 mt-0.5">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <div>
                <p className="font-medium">Order Confirmation</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive a confirmation email at {orderData.email} within a few minutes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex size-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 mt-0.5">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <div>
                <p className="font-medium">Processing</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll prepare your order and notify you when it ships.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex size-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 mt-0.5">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-sm text-muted-foreground">
                  Your order will be delivered to the provided address within 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/dashboard/purchases">View Order History</Link>
        </Button>
      </div>
    </div>
  )
}