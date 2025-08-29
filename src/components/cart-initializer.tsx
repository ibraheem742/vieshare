"use client"

import { useCartInitializer } from "@/lib/hooks/use-cart"

export function CartInitializer({ children }: { children: React.ReactNode }) {
  // Initialize cart when component mounts
  useCartInitializer()
  
  return <>{children}</>
}