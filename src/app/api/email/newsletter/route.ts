// import { db } from "@/db"
// import { notifications } from "@/db/schema"
import { env } from "@/env.js"
// import { eq } from "drizzle-orm"
import { z } from "zod"

import { resend } from "@/lib/resend"
import { joinNewsletterSchema } from "@/lib/validations/notification"
import NewsletterWelcomeEmail from "@/components/emails/newsletter-welcome-email"

export async function POST(req: Request) {
  const input = joinNewsletterSchema.parse(await req.json())

  try {
    // TODO: Replace with PocketBase implementation
    // Temporarily disabled database operations

    await resend.emails.send({
      from: env.EMAIL_FROM_ADDRESS,
      to: input.email,
      subject: input.subject ?? "Welcome to TrendsAI",
      react: NewsletterWelcomeEmail({
        firstName: "",
        fromEmail: env.EMAIL_FROM_ADDRESS,
        token: input.token,
      }),
    })

    return new Response(null, { status: 200 })
  } catch (error) {
    console.error(error)

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 })
    }

    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    }

    return new Response("Something went wrong", { status: 500 })
  }
}
