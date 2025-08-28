"use client"

import * as React from "react"
import Link from "next/link"
import { getCartItems } from "@/lib/actions/cart" // Server action
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"

export function CartButton() {
  const [itemCount, setItemCount] = React.useState(0)

  React.useEffect(() => {
    const fetchCart = async () => {
      const items = await getCartItems({}) // Pass empty object, as getCartItems handles cartId internally
      const count = items.reduce((total, item) => total + item.quantity, 0)
      setItemCount(count)
    }

    void fetchCart() // <--- Add void here to explicitly ignore the promise
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      asChild
    >
      <Link href="/cart">
        <Icons.cart className="size-4" aria-hidden="true" />
        <span className="sr-only">Cart</span>
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {itemCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
