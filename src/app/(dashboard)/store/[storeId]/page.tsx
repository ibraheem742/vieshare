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

interface DashboardStorePageProps {
  params: Promise<{
    storeId: string
  }>
}

async function getStoreFromParams(params: Awaited<DashboardStorePageProps["params"]>) {
  const { storeId } = params

  if (!storeId || storeId.length < 15) {
    console.error("Invalid storeId:", storeId)
    return null
  }

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
}: DashboardStorePageProps): Promise<Metadata> {
  const resolvedParams = await params
  const store = await getStoreFromParams(resolvedParams)

  if (!store) {
    return {}
  }

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: `Manage ${store.name} store`,
    description:
      store.description ?? "Manage inventory, orders, and more in your store.",
  }
}

export default async function DashboardStorePage({
  params,
}: DashboardStorePageProps) {
  const resolvedParams = await params
  const store = await getStoreFromParams(resolvedParams)

  if (!store) {
    notFound()
  }

  return (
    <div className="space-y-10">
      <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="line-clamp-1 text-2xl">
              Connect to Stripe
            </CardTitle>
            <CardDescription>
              Connect your store to Stripe to start accepting payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">
              Stripe integration has been disabled.
            </div>
          </CardContent>
        </Card>
      <Card as="section">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Update your store</CardTitle>
          <CardDescription>
            Update your store name and description, or delete it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={updateStoreAction.bind(null, store.id)}
            className="grid w-full max-w-xl gap-5"
          >
            <div className="grid gap-2.5">
              <Label htmlFor="update-store-name">Name</Label>
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
              {/* <LoadingButton
                formAction={deleteStore.bind(null, store.id)}
                variant="destructive"
                action="delete"
              >
                Delete store
                <span className="sr-only">Delete store</span>
              </LoadingButton> */}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
