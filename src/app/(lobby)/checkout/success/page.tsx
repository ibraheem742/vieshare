import type { Metadata } from "next"

import { Shell } from "@/components/shell"
import { OrderSuccessContent } from "./_components/order-success-content"

export const metadata: Metadata = {
  title: "Order Successful",
  description: "Your order has been placed successfully",
}

export default function CheckoutSuccessPage() {
  return (
    <Shell>
      <OrderSuccessContent />
    </Shell>
  )
}