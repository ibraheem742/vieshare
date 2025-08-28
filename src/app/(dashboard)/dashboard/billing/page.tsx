import * as React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { env } from "@/env.js"
import { RocketIcon } from "@radix-ui/react-icons"

import { getCachedUser } from "@/lib/queries/user"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { Shell } from "@/components/shell"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Billing",
  description: "Manage your billing and subscription plan",
}

export default async function BillingPage() {
  const user = await getCachedUser()

  if (!user) {
    redirect("/signin")
  }

  // TODO: Implement usage metrics display
  // const usageMetricsPromise = getUserUsageMetrics({ userId: user.id })

  return (
    <Shell variant="sidebar">
      <PageHeader>
        <PageHeaderHeading size="sm">Billing</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Manage your billing and subscription plan
        </PageHeaderDescription>
      </PageHeader>
      <Alert>
        <RocketIcon className="size-4" />
        <AlertTitle>Notice</AlertTitle>
        <AlertDescription>
          Billing functionality has been temporarily disabled.
        </AlertDescription>
      </Alert>
      <div className="text-muted-foreground">
        Billing management has been disabled.
      </div>
    </Shell>
  )
}
