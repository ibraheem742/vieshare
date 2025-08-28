"use client"

import * as React from "react"
import Link from "next/link"
import { useCart, useCartInitializer } from "@/lib/hooks/use-cart"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CartButton() {
  const [mounted, setMounted] = React.useState(false)
  const itemCount = useCart((state) => state.itemCount)
  const isLoading = useCart((state) => state.isLoading)
  
  // Initialize cart on mount
  useCartInitializer()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't show count until mounted (to prevent hydration mismatch)
  const displayItemCount = mounted ? itemCount : 0
  const displayCount = displayItemCount > 99 ? "99+" : displayItemCount.toString()
  const showBadge = mounted && displayItemCount > 0

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      asChild
    >
      <Link href="/cart">
        <Icons.cart 
          className={cn(
            "size-4 transition-all duration-200",
            isLoading && "animate-pulse",
            showBadge && "text-primary"
          )} 
          aria-hidden="true" 
        />
        <span className="sr-only">
          Cart {showBadge ? `(${displayItemCount} items)` : "(empty)"}
        </span>
        {showBadge && (
          <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 py-0.5 text-xs font-medium text-primary-foreground animate-in zoom-in-50 duration-200">
            {displayCount}
          </span>
        )}
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-1 rounded-full bg-primary/40 animate-ping" />
          </div>
        )}
      </Link>
    </Button>
  )
}
