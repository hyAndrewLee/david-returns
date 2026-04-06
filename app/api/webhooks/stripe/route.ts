import { NextResponse } from "next/server"
import Stripe from "stripe"
import { fulfillCheckout } from "@/server/services/fulfillment"
import { adminDb } from "@/server/db"
import { subscriptions } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { createLogger } from "@/lib/logger"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const log = createLogger("stripe-webhook")
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const POST = async (request: Request) => {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    log.warn("webhook received without stripe-signature header")
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    log.error({ error: err }, "webhook signature verification failed")
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  log.info({ eventType: event.type, eventId: event.id }, "webhook event received")

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        log.info({ sessionId: session.id, userId: session.metadata?.user_id }, "checkout.session.completed")

        const result = await fulfillCheckout(session.id)

        if (!result.success) {
          log.error({ sessionId: session.id, error: result.error }, "webhook fulfillment failed")
        } else if (result.alreadyFulfilled) {
          log.info({ sessionId: session.id, orderId: result.orderId }, "webhook: order already fulfilled by return page")
        } else {
          log.info({ sessionId: session.id, orderId: result.orderId }, "webhook: order fulfilled")
        }

        break
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session
        log.info({ sessionId: session.id }, "checkout.session.async_payment_succeeded")

        await fulfillCheckout(session.id)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // When cancel_at_period_end is true, Stripe keeps status as "active" but
        // we use "canceling" to distinguish it from a normally-renewing subscription.
        const dbStatus =
          subscription.status === "active" && subscription.cancel_at_period_end
            ? "canceling"
            : subscription.status

        await adminDb
          .update(subscriptions)
          .set({
            status: dbStatus,
            currentPeriodStart: new Date(
              ((subscription as unknown as Record<string, number>).current_period_start ?? Math.floor(Date.now() / 1000)) * 1000,
            ),
            currentPeriodEnd: new Date(
              ((subscription as unknown as Record<string, number>).current_period_end ?? Math.floor(Date.now() / 1000)) * 1000,
            ),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await adminDb
          .update(subscriptions)
          .set({
            status: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        break
      }
    }

    log.info({ eventType: event.type, eventId: event.id }, "webhook processed successfully")
    return NextResponse.json({ received: true })
  } catch (error) {
    log.error({ error, eventType: event.type, eventId: event.id }, "fatal error processing webhook")
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
