"use client"

import { siteConfig } from "@/config/site"
import { useAuth } from "@/lib/hooks/use-auth-axios"
import { AuthDropdown } from "@/components/layouts/auth-dropdown"
import { MainNav } from "@/components/layouts/main-nav"
import { MobileNav } from "@/components/layouts/mobile-nav"
import { ProductsCombobox } from "@/components/products-combobox"
import { CartButton } from "@/components/cart-button"

export function SiteHeader() {
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <MainNav items={siteConfig.mainNav} />
        <MobileNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ProductsCombobox />
            <CartButton />
            {/* Cart disabled */}
            <AuthDropdown />
          </nav>
        </div>
      </div>
    </header>
  )
}
