// TODO: Replace with PocketBase auth implementation
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"])

// Temporary middleware - passes through all requests
// TODO: Implement PocketBase authentication middleware
export default function middleware(_request: NextRequest) {
  // For now, just pass through all requests
  // Later, implement PocketBase auth checks here
  return NextResponse.next()
}

// export default clerkMiddleware((auth, req) => {
//   if (isProtectedRoute(req)) {
//     const url = new URL(req.nextUrl.origin)

//     auth().protect({
//       unauthenticatedUrl: `${url.origin}/signin`,
//       unauthorizedUrl: `${url.origin}/dashboard/stores`,
//     })
//   }
// })

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
