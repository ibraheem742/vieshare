import type { Metadata } from "next"

import { Shell } from "@/components/shell"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { CheckoutForm } from "./_components/checkout-form"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order",
}

export default function CheckoutPage() {
  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">Checkout</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Complete your order information
        </PageHeaderDescription>
      </PageHeader>
      <div className="grid gap-8 lg:grid-cols-2">
        <CheckoutForm />
      </div>
    </Shell>
  )
}