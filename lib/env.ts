const requiredEnvVars = {
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY,

  // Admin Auth
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
} as const

export const validateEnv = () => {
  // Only validate in production or if explicitly enabled
  if (process.env.NODE_ENV !== "production" && process.env.VALIDATE_ENV !== "true") {
    return
  }

  const missing: string[] = []

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === "") {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\n` +
        "Please set these in your Vercel project settings or .env file.",
    )
  }

  // Validate Stripe keys are in correct mode for production
  if (process.env.NODE_ENV === "production") {
    const stripeSecret = process.env.STRIPE_SECRET_KEY || ""
    const stripePublic = process.env.STRIPE_PUBLISHABLE_KEY || ""

    if (stripeSecret.includes("_test_") || stripePublic.includes("_test_")) {
      console.warn(
        "⚠️  WARNING: Using Stripe TEST keys in production environment!\n" +
          "Please switch to live keys (pk_live_... and sk_live_...)",
      )
    }
  }
}
