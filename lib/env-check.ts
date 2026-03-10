// Production environment variable validation
export const validateEnvVars = () => {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET", // Required for production
    "BLOB_READ_WRITE_TOKEN",
    "RESEND_API_KEY",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}
