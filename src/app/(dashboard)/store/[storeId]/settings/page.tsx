import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { env } from "@/env.js"
import { pb, COLLECTIONS } from "@/lib/pocketbase"

import { updateStoreAction } from "@/lib/actions/store"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingButton } from "@/components/loading-button"

interface DashboardStoreSettingsPageProps {
  params: Promise<{
    storeId: string
  }>
}

async function getStoreFromParams(params: Awaited<DashboardStoreSettingsPageProps["params"]>) {
  const { storeId } = params

  try {
    const store = await pb.collection(COLLECTIONS.STORES).getOne(storeId)
    return store
  } catch (error) {
    console.error("Error fetching store:", error)
    return null
  }
}

export async function generateMetadata({
  params,
}: DashboardStoreSettingsPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const store = await getStoreFromParams(resolvedParams)

  if (!store) {
    return {}
  }

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: `${store.name} settings`,
    description: `Manage ${store.name} store settings, update store information, and configure store preferences.`,
  }
}

export default async function DashboardStoreSettingsPage({
  params,
}: DashboardStoreSettingsPageProps) {
  const resolvedParams = await params
  const store = await getStoreFromParams(resolvedParams)

  if (!store) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Store Information</CardTitle>
          <CardDescription>
            Update your store name and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={updateStoreAction.bind(null, store.id)}
            className="grid w-full max-w-xl gap-5"
          >
            <div className="grid gap-2.5">
              <Label htmlFor="update-store-name">Store Name</Label>
              <Input
                id="update-store-name"
                aria-describedby="update-store-name-description"
                name="name"
                required
                minLength={3}
                maxLength={50}
                placeholder="Type store name here."
                defaultValue={store.name}
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="update-store-description">Description</Label>
              <Textarea
                id="update-store-description"
                aria-describedby="update-store-description-description"
                name="description"
                minLength={3}
                maxLength={255}
                placeholder="Type store description here."
                defaultValue={store.description ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2 xs:flex-row">
              <LoadingButton action="update">
                Update store
                <span className="sr-only">Update store</span>
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Store Details</CardTitle>
          <CardDescription>
            View your store details and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Store ID</Label>
            <div className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              {store.id}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Store Slug</Label>
            <div className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              {store.slug}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Plan</Label>
            <div className="text-sm text-muted-foreground capitalize">
              {store.plan || 'free'}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Product Limit</Label>
            <div className="text-sm text-muted-foreground">
              {store.product_limit || 10} products
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}