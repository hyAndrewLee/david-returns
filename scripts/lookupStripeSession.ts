/**
 * Recovery utility: look up a Stripe Checkout Session and its order metadata
 * by passing either a Checkout Session ID (`cs_...`) or a Payment Intent ID (`pi_...`).
 *
 * Read-only — does NOT touch the database.
 *
 * Usage:
 *   doppler run --config prd -- bun run scripts/lookupStripeSession.ts <cs_... | pi_...>
 */

import Stripe from "stripe"

const id = process.argv[2]

if (!id) {
  console.error("Usage: bun run scripts/lookupStripeSession.ts <cs_... | pi_...>")
  process.exit(1)
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set. Run via `doppler run --config <env> -- ...`")
  process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const main = async () => {
  let session: Stripe.Checkout.Session

  if (id.startsWith("cs_")) {
    session = await stripe.checkout.sessions.retrieve(id, {
      expand: ["subscription", "line_items", "customer"],
    })
  } else if (id.startsWith("pi_")) {
    const list = await stripe.checkout.sessions.list({
      payment_intent: id,
      limit: 1,
      expand: ["data.subscription", "data.line_items", "data.customer"],
    })

    if (list.data.length === 0) {
      console.error(`No Checkout Session found for payment_intent ${id}`)
      process.exit(1)
    }

    session = list.data[0]
  } else {
    console.error(`Unsupported ID format: ${id}. Expected cs_... or pi_...`)
    process.exit(1)
  }

  const livemode = (session as unknown as { livemode?: boolean }).livemode
  const keyPrefix = process.env.STRIPE_SECRET_KEY!.substring(0, 8)

  console.log("====== Checkout Session ======")
  console.log("Stripe key prefix:", keyPrefix, "(livemode:", livemode, ")")
  console.log("Session ID:        ", session.id)
  console.log("Mode:              ", session.mode)
  console.log("Payment status:    ", session.payment_status)
  console.log("Status:            ", session.status)
  console.log("Amount total:      ", session.amount_total, session.currency)
  console.log("Customer ID:       ", session.customer)
  console.log("Customer email:    ", session.customer_email || session.customer_details?.email)
  console.log("Payment Intent:    ", session.payment_intent)
  console.log("Subscription:      ", session.subscription)
  console.log("Created at:        ", new Date(session.created * 1000).toISOString())
  console.log("====== Metadata (raw) ======")
  console.log(JSON.stringify(session.metadata, null, 2))

  if (session.metadata?.order_data || session.metadata?.order_data_chunks) {
    const blob = session.metadata.order_data
      || Array.from({ length: parseInt(session.metadata.order_data_chunks ?? "0") })
        .map((_, i) => session.metadata![`order_data_${i}`] ?? "")
        .join("")

    try {
      const parsed = JSON.parse(blob)
      console.log("====== Decoded order_data ======")
      console.log(JSON.stringify(parsed, null, 2))
    } catch (e) {
      console.log("Failed to parse order_data blob:", e)
    }
  } else {
    console.log("⚠️  No order_data / order_data_chunks in session metadata")
  }
}

main().catch((err) => {
  console.error("Lookup failed:", err)
  process.exit(1)
})
