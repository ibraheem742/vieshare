import * as React from "react"
import { type Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { env } from "@/env.js"

import { getCachedUser } from "@/lib/queries/user"
import { getStoresByUserId } from "@/lib/queries/store"
import { Button } from "@/components/ui/button"
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
import { Icons } from "@/components/icons"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Dashboard",
  description: "Manage your stores and account",
}

export default async function DashboardPage() {
  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  const stores = await getStoresByUserId({ userId: user.id })
  
  // Debug logging
  console.log('Dashboard - User ID:', user.id)
  console.log('Dashboard - Stores found:', stores.length)
  console.log('Dashboard - Store details:', stores.map(s => ({ id: s.id, name: s.name })))

  return (
    <Shell variant="sidebar">
      <PageHeader>
        <PageHeaderHeading size="sm">Dashboard</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Manage your stores and account
        </PageHeaderDescription>
      </PageHeader>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <Icons.store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stores.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
              <Icons.activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stores.filter(store => store.active).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Stores</CardTitle>
                <CardDescription>
                  Manage your stores and their products
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/onboarding?step=create">
                  <Icons.add className="mr-2 h-4 w-4" />
                  Create Store
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Icons.store className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No stores yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first store
                </p>
                <Button asChild>
                  <Link href="/onboarding?step=create">
                    <Icons.add className="mr-2 h-4 w-4" />
                    Create Store
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stores.map((store) => (
                  <Card key={store.id} className="transition-colors hover:bg-muted/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="line-clamp-1">{store.name}</CardTitle>
                        <div className={`h-2 w-2 rounded-full ${store.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                      {store.description && (
                        <CardDescription className="line-clamp-2">
                          {store.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Plan: <span className="capitalize">{store.plan || 'free'}</span>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/store/${store.id || 'invalid'}`}>
                            Manage
                            <Icons.arrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}