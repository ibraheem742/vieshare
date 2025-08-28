// @see https://github.com/juliusmarminge/acme-corp/blob/main/apps/nextjs/src/app/(dashboard)/onboarding/multi-step-form.tsx

"use client"

import { useSearchParams } from "next/navigation"
import { AnimatePresence } from "framer-motion"

import { CreateStore } from "./create-store"
import { Intro } from "./intro"

interface OnboardingProps {
  userId: string
}

export function Onboarding({ userId }: OnboardingProps) {
  const search = useSearchParams()
  const step = search.get("step")
  const _storeId = search.get("store")

  return (
    <AnimatePresence mode="wait">
      {!step && <Intro key="intro" />}
      {step === "create" && <CreateStore userId={userId} />}
      {step === "connect" && <div>Stripe connection disabled</div>}
    </AnimatePresence>
  )
}
