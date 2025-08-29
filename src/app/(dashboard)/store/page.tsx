import { redirect } from "next/navigation"
import { getCachedUser } from "@/lib/queries/user"
import { getStoresByUserId } from "@/lib/queries/store"

// Redirect to first store or dashboard
export default async function StoreRootPage() {
  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  const stores = await getStoresByUserId({ userId: user.id })

  if (stores.length === 0) {
    redirect("/onboarding")
  }

  // Redirect to first store
  redirect(`/store/${stores[0]!.id}`)
}