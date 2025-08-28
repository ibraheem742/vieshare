"use client"

import * as React from "react"
// TODO: Replace with PocketBase OAuth callback handling
// import { useClerk } from "@clerk/nextjs"
// import { type HandleOAuthCallbackParams } from "@clerk/types"
interface HandleOAuthCallbackParams {
  [key: string]: string | string[] | undefined
}

import { Icons } from "@/components/icons"

interface SSOCallbackProps {
  searchParams: HandleOAuthCallbackParams
}

export function SSOCallback({ searchParams }: SSOCallbackProps) {
  // TODO: Replace with PocketBase OAuth callback handling
  // const { handleRedirectCallback } = useClerk()

  React.useEffect(() => {
    // TODO: Implement PocketBase OAuth callback
    // void handleRedirectCallback(searchParams)
    console.log("TODO: Handle OAuth callback with PocketBase", searchParams)
  }, [searchParams])

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-describedby="loading-description"
      className="flex items-center justify-center"
    >
      <Icons.spinner className="size-16 animate-spin" aria-hidden="true" />
    </div>
  )
}
