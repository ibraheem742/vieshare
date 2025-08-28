"use client"

import * as React from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"

import { Skeleton } from "@/components/ui/skeleton"
import { GridPattern } from "@/components/grid-pattern"
import { Shell } from "@/components/shell"

import { Onboarding } from "./_components/onboarding"

export default function OnboardingPage() {
  const { user, isLoading } = useAuth()

  React.useEffect(() => {
    if (!isLoading && !user) {
      redirect("/signin")
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <Shell className="h-[calc(100vh-4rem)] max-w-screen-sm">
        <div className="flex items-center justify-center">
          <Skeleton className="h-8 w-48" />
        </div>
      </Shell>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Shell className="h-[calc(100vh-4rem)] max-w-screen-sm">
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className="[mask-image:radial-gradient(300px_circle_at_left_top,white,transparent)]"
      />
      <React.Suspense fallback={<Skeleton className="size-full" />}>
        <Onboarding userId={user.id} />
      </React.Suspense>
    </Shell>
  )
}
