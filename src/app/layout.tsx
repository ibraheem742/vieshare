import type { Metadata, Viewport } from "next"
import { env } from "@/env.js"

import "@/styles/globals.css"

import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import { siteConfig } from "@/config/site"
import { fontHeading } from "@/lib/fonts"
import { absoluteUrl, cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { ThemeProvider } from "@/components/providers"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { AuthProvider } from "@/lib/hooks/use-auth-axios"
import { CartInitializer } from "@/components/cart-initializer"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "nextjs",
    "react",
    "react server components",
    "vieshare",
    "vieboarding",
    "kickflip",
  ],
  authors: [
    {
      name: "khieu-dv",
      url: "https://www.vieshare.com",
    },
  ],
  creator: "khieu-dv",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@khieu-dv",
  },
  icons: {
    icon: "/icon.png",
  },
  manifest: absoluteUrl("/site.webmanifest"),
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable,
          fontHeading.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartInitializer>
              {children}
              <TailwindIndicator />
              <Analytics />
            </CartInitializer>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
