import "server-only"

import Stripe from "stripe"
import { adminDb } from "@/server/db"
import { orders, profiles, subscriptions } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { stripe } from "@/server/services/stripe"
import { decodeOrderMetadata } from "@/server/services/stripeMetadata"
import { notifyOrderCreated } from "@/server/services/orderNotifications"
import { createLogger } from "@/lib/logger"

const log = createLogger("fulfillment")

type FulfillResult = {
  success: boolean
  orderId?: string
  alreadyFulfilled?: boolean
  isMembership?: boolean
  error?: string
}

/**
 * Idempotent fulfillment function following Stripe's recommended pattern.
 * Called from both the return-page tRPC mutation and the webhook handler.
 *
 * 1. Retrieves the Checkout Session from Stripe
 * 2. Checks payment_status to confirm payment
 * 3. Creates the order (idempotent on stripeSessionId)
 * 4. For subscriptions, activates the membership
 * 5. Sends confirmation emails
 */
export const fulfillCheckout = async (sessionId: string): Promise<FulfillResult> => {
  log.info({ sessionId }, "fulfillCheckout started")

  const [existingOrder] = await adminDb
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1)

  if (existingOrder) {
    log.info({ sessionId, orderId: existingOrder.id }, "order already fulfilled, skipping")
    return { success: true, orderId: existingOrder.id, alreadyFulfilled: true }
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  })

  if (session.payment_status === "unpaid") {
    log.warn({ sessionId, paymentStatus: session.payment_status }, "session not paid, skipping fulfillment")
    return { success: false, error: "Payment not completed" }
  }

  const orderData = decodeOrderMetadata(session.metadata)
  if (!orderData) {
    log.error({ sessionId }, "failed to decode order data from session metadata")
    return { success: false, error: "Missing order data in session" }
  }

  const totalAmount = orderData.totalAmount || session.amount_total || 0
  const isMembership = session.mode === "subscription"

  const [order] = await adminDb
    .insert(orders)
    .values({
      userId: orderData.userId,
      pickupDate: orderData.pickupDate,
      pickupTime: orderData.pickupTime,
      pickupMethod: orderData.pickupMethod,
      address: orderData.address,
      items: orderData.items,
      isInstant: orderData.isInstant,
      totalAmount,
      status: "scheduled",
      stripeSessionId: sessionId,
      stripePaymentIntentId:
        (session.payment_intent as string) || (session.subscription as string) || null,
    })
    .returning()

  log.info({ sessionId, orderId: order.id, mode: session.mode }, "order created")

  if (isMembership && session.subscription) {
    const subscription = typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription as Stripe.Subscription

    const [existingSub] = await adminDb
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.userId, orderData.userId))
      .limit(1)

    const subscriptionData = {
      userId: orderData.userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      plan: "membership",
      currentPeriodStart: new Date(
        ((subscription as unknown as Record<string, number>).current_period_start ?? Math.floor(Date.now() / 1000)) * 1000,
      ),
      currentPeriodEnd: new Date(
        ((subscription as unknown as Record<string, number>).current_period_end ?? Math.floor(Date.now() / 1000)) * 1000,
      ),
      updatedAt: new Date(),
    }

    if (existingSub) {
      await adminDb.update(subscriptions).set(subscriptionData).where(eq(subscriptions.id, existingSub.id))
    } else {
      await adminDb.insert(subscriptions).values(subscriptionData)
    }

    await adminDb
      .update(profiles)
      .set({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: session.customer as string,
      })
      .where(eq(profiles.id, orderData.userId))

    log.info({ userId: orderData.userId, subscriptionId: subscription.id }, "membership activated")
  }

  await notifyOrderCreated({
    order,
    isMembership,
    sessionCustomerEmail: session.customer_email,
  })

  return { success: true, orderId: order.id, isMembership }
}
