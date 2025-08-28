import type { Metadata } from "next"
import type { SearchParams } from "@/types"

import { getAllStores } from "@/lib/queries/store"
import { Shell } from "@/components/shell"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { StoreCard } from "@/components/store-card"

export const metadata: Metadata = {
  title: "Stores",
  description: "Buy products from our stores",
}

interface StoresPageProps {
  searchParams: Promise<SearchParams>
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const resolvedSearchParams = await searchParams
  const { data: stores, pageCount } = await getAllStores(resolvedSearchParams)

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">Stores</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Buy products from our stores
        </PageHeaderDescription>
      </PageHeader>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} href={`/collections/${store.id}`} />
        ))}
      </div>
      {stores.length === 0 && (
        <div className="flex h-60 items-center justify-center">
          <p className="text-muted-foreground">No stores found</p>
        </div>
      )}
    </Shell>
  )
}