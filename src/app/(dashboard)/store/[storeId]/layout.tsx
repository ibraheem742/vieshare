import * as React from "react"
import { redirect } from "next/navigation"

import { getStoresByUserId } from "@/lib/queries/store"
import { getCachedUser, getUserPlanMetrics } from "@/lib/queries/user"
import { Skeleton } from "@/components/ui/skeleton"

import { SidebarProvider } from "../../../../components/layouts/sidebar-provider"
import { DashboardHeader } from "./_components/dashboard-header"
import { DashboardSidebar } from "./_components/dashboard-sidebar"
import { DashboardSidebarSheet } from "./_components/dashboard-sidebar-sheet"
import { StoreSwitcher } from "./_components/store-switcher"

interface DashboardStoreLayoutProps {
  params: Promise<{
    storeId: string
  }>
  children: React.ReactNode
}

export default async function DashboardStoreLayout({
  children,
  params,
}: DashboardStoreLayoutProps) {
  const { storeId } = await params
  const decodedStoreId = decodeURIComponent(storeId)

  console.log('=== STORE LAYOUT DEBUG ===')
  console.log('Original storeId from params:', storeId)
  console.log('Decoded storeId:', decodedStoreId)
  console.log('StoreId type:', typeof storeId)
  console.log('StoreId length:', storeId.length)

  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  console.log('User found:', user.id)

  const stores = await getStoresByUserId({ userId: user.id })
  console.log('User stores:', stores.map(s => ({ id: s.id, name: s.name })))
  console.log('Looking for storeId:', decodedStoreId)
  console.log('Raw storeId from params:', storeId)

  // Handle invalid storeId cases
  if (!storeId || storeId === 'storeId' || storeId === 'invalid') {
    console.error('Invalid storeId provided:', storeId)
    redirect("/dashboard")
  }
  
  const userStore = stores.find(store => store.id === decodedStoreId)
  
  // Redirect if store doesn't exist or doesn't belong to user
  if (!userStore) {
    console.error('Store not found or does not belong to user:', decodedStoreId)
    console.error('Available stores:', stores.map(s => s.id))
    console.error('Total stores found:', stores.length)
    
    // If no stores exist, redirect to onboarding
    if (stores.length === 0) {
      console.log('No stores found, redirecting to onboarding')
      redirect("/onboarding")
    }
    
    // If stores exist but storeId doesn't match, redirect to dashboard
    redirect("/dashboard")
  }

  const storesPromise = Promise.resolve(stores)
  const planMetricsPromise = getUserPlanMetrics({ userId: user.id })

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[17.5rem_1fr]">
        <DashboardSidebar
          storeId={decodedStoreId}
          className="top-0 z-30 hidden flex-col gap-4 border-r border-border/60 lg:sticky lg:block"
        >
          <React.Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <StoreSwitcher
              userId={user.id}
              storesPromise={storesPromise}
              planMetricsPromise={planMetricsPromise}
            />
          </React.Suspense>
        </DashboardSidebar>
        <div className="flex flex-col">
          <DashboardHeader storeId={decodedStoreId}>
            <DashboardSidebarSheet className="lg:hidden">
              <DashboardSidebar storeId={decodedStoreId}>
                <React.Suspense fallback={<Skeleton className="h-10 w-full" />}>
                  <StoreSwitcher
                    userId={user.id}
                    storesPromise={storesPromise}
                    planMetricsPromise={planMetricsPromise}
                  />
                </React.Suspense>
              </DashboardSidebar>
            </DashboardSidebarSheet>
          </DashboardHeader>
          <main className="flex-1 overflow-hidden px-6 pt-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
