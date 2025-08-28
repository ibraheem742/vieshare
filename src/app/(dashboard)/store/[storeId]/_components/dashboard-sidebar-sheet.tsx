"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Icons } from "@/components/icons"
import { Logo } from "@/components/logo"

import { useSidebar } from "../../../../../components/layouts/sidebar-provider"

export interface DashboardSidebarSheetProps
  extends React.ComponentPropsWithRef<typeof SheetTrigger>,
    ButtonProps {}

export function DashboardSidebarSheet({
  children,
  className,
  ...props
}: DashboardSidebarSheetProps) {
  const { open, setOpen } = useSidebar()
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  if (isDesktop) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:size-8",
            className
          )}
          {...props}
        >
          <Icons.menu className="size-5" aria-hidden="true" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="inset-y-0 flex h-auto w-[18.75rem] flex-col items-center gap-4 px-0 py-4"
      >
        <SheetClose asChild>
          <Link
            href="/"
            className="mx-6 flex items-center self-start font-heading tracking-wider text-foreground/90 transition-colors hover:text-foreground"
          >
            <Logo className="size-6" aria-hidden="true" />
          </Link>
        </SheetClose>
        {children}
      </SheetContent>
    </Sheet>
  )
}
