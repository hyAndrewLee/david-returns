import { NextResponse } from "next/server"

export async function GET() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ""
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || ""
  const nextPublicStripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || ""

  // Determine Stripe mode
  const secretKeyMode = stripeSecretKey.startsWith("sk_live_")
    ? "LIVE"
    : stripeSecretKey.startsWith("sk_test_")
      ? "TEST"
      : "UNKNOWN"

  const publishableKeyMode = stripePublishableKey.startsWith("pk_live_")
    ? "LIVE"
    : stripePublishableKey.startsWith("pk_test_")
      ? "TEST"
      : "UNKNOWN"

  const nextPublicKeyMode = nextPublicStripeKey.startsWith("pk_live_")
    ? "LIVE"
    : nextPublicStripeKey.startsWith("pk_test_")
      ? "TEST"
      : "UNKNOWN"

  const webhookSecretMode = stripeWebhookSecret.includes("_test_")
    ? "TEST"
    : stripeWebhookSecret.startsWith("whsec_")
      ? "LIVE"
      : "UNKNOWN"

  return NextResponse.json({
    environment: process.env.NODE_ENV || "development",
    stripeMode: secretKeyMode,
    keys: {
      STRIPE_SECRET_KEY: {
        configured: !!stripeSecretKey,
        prefix: stripeSecretKey.substring(0, 15) + "...",
        mode: secretKeyMode,
      },
      STRIPE_PUBLISHABLE_KEY: {
        configured: !!stripePublishableKey,
        prefix: stripePublishableKey.substring(0, 15) + "...",
        mode: publishableKeyMode,
      },
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
        configured: !!nextPublicStripeKey,
        prefix: nextPublicStripeKey.substring(0, 15) + "...",
        mode: nextPublicKeyMode,
      },
      STRIPE_WEBHOOK_SECRET: {
        configured: !!stripeWebhookSecret,
        prefix: stripeWebhookSecret.substring(0, 15) + "...",
        mode: webhookSecretMode,
      },
      SLACK_WEBHOOK_URL: {
        configured: !!slackWebhookUrl,
        prefix: slackWebhookUrl.substring(0, 30) + "...",
      },
    },
    warnings: [
      secretKeyMode !== publishableKeyMode && "Secret key and Publishable key are in different modes!",
      publishableKeyMode !== nextPublicKeyMode &&
        "Publishable keys mismatch between STRIPE_PUBLISHABLE_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!",
      secretKeyMode !== webhookSecretMode && "Stripe keys and webhook secret are in different modes!",
    ].filter(Boolean),
  })
}
