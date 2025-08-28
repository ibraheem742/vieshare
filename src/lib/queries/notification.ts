import "server-only"

import { unstable_noStore as noStore } from "next/cache"
import { pb } from "@/lib/pocketbase"

export async function getNotification(input: {
  token?: string
  email?: string
}) {
  noStore()

  try {
    // TODO: Replace with actual PocketBase notification collection
    // For now, return mock data
    return {
      token: input.token || "mock-token",
      email: input.email || "mock@email.com",
      newsletter: true,
      marketing: false,
    }
  } catch (err) {
    return null
  }
}
