import { type Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { env } from "@/env.js"

import { getOrderLineItems } from "@/lib/actions/order"
import { pb } from "@/lib/pocketbase"
import { formatId, formatPrice } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"

interface OrderType {
  id: string;
  created: string;
  amount: string;
  expand?: {
    store?: StoreType;
  };
}

interface StoreType {
  name?: string;
}

interface CheckoutItemType {
  productId: string;
  name: string;
  price: string;
  quantity: number;
}

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Purchase",
  description: "View your purchase details",
}

interface PurchasePageProps {
  params: Promise<{
    purchaseId: string
  }>
}

export default async function PurchasePage({ params }: PurchasePageProps) {
  // Using the purchaseId as the orderId in the sql query
  const { purchaseId } = await params
  const orderId = decodeURIComponent(purchaseId)

  try {
    const fetchedOrder = await pb.collection('orders').getOne(orderId, {
      expand: 'store'
    });
    const order: OrderType = fetchedOrder as unknown as OrderType;

    if (!order) {
      notFound()
    }

    const orderLineItems: CheckoutItemType[] = await getOrderLineItems({
      id: order.id,
    })

    const store = order.expand?.store

    return (
      <Shell variant="sidebar">
        <PageHeader>
          <PageHeaderHeading size="sm">Purchase</PageHeaderHeading>
          <PageHeaderDescription size="sm">
            View your purchase details
          </PageHeaderDescription>
        </PageHeader>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="line-clamp-1">
              Purchase from {store?.name ?? "Unknown Store"}
            </CardTitle>
            <CardDescription>
              Order {formatId(order.id)} placed on{" "}
              {new Date(order.created).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="space-y-1.5">
              {orderLineItems.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col">
                      <span className="line-clamp-1 text-sm font-medium">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      x{item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total</span>
              <span className="font-medium">
                {formatPrice(parseFloat(order.amount))}
              </span>
            </div>
          </CardContent>
        </Card>
        <Link
          href="/dashboard/purchases"
          className="text-sm text-muted-foreground underline"
        >
          Back to purchases
        </Link>
      </Shell>
    )
  } catch (error) {
    console.error('Error fetching order:', error)
    notFound()
  }
}
