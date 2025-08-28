import { type Metadata } from "next"
import { cookies } from "next/headers"
import { env } from "@/env.js"
import { getCartItems } from "@/lib/actions/cart"
import { productsSearchParamsSchema } from "@/lib/validations/params"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Build a Board",
  description: "Select the components for your board",
}

interface BuildABoadPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

export default async function BuildABoardPage({
  searchParams,
}: BuildABoadPageProps) {
  const resolvedSearchParams = await searchParams
  const { page, per_page, sort, subcategory, price_range, active } =
    productsSearchParamsSchema.parse(resolvedSearchParams)

  // Products transaction
  const limit = typeof per_page === "string" ? parseInt(per_page) : 8
  const offset = typeof page === "string" ? (parseInt(page) - 1) * limit : 0
  const activeSubcategory =
    typeof subcategory === "string" ? subcategory : "decks"

  // Get cart items
  const cartId = (await cookies()).get("cartId")?.value
  const cartItems = await getCartItems({ cartId })

  return (
    <Shell className="gap-4">
      <PageHeader
        id="build-a-board-header"
        aria-labelledby="build-a-board-header-heading"
      >
        <PageHeaderHeading size="sm">Build a Board</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Select the components for your board
        </PageHeaderDescription>
      </PageHeader>
    </Shell>
  )
}
