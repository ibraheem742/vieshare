import type { Metadata } from "next"

import { Shell } from "@/components/shell"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { CartItems } from "./_components/cart-items"

export const metadata: Metadata = {
  title: "Cart",
  description: "Checkout with your cart items",
}

export default function CartPage() {
  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">Checkout</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Checkout with your cart items
        </PageHeaderDescription>
      </PageHeader>
      <CartItems />
    </Shell>
  )
}