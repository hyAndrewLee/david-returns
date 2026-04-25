import "server-only"

import { eq } from "drizzle-orm"
import { adminDb } from "@/server/db"
import { profiles } from "@/server/db/schema"
import type { Order, OrderAddress } from "@/server/db/schema/orders"
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/server/services/email"
import { sendSlackOrderNotification } from "@/server/services/slack"
import { createLogger } from "@/lib/logger"

const log = createLogger("order-notifications")

type NotifyOrderCreatedProps = {
  order: Order
  isMembership: boolean
  sessionCustomerEmail?: string | null
}

/**
 * Fires all external notifications for a newly-created order.
 * Used by every order-creation path: paid checkout fulfillment, 100%-discount
 * free orders, and member (no-payment) orders. Each notifier is wrapped in
 * its own try/catch — one failure never blocks the others.
 */
export const notifyOrderCreated = async ({
  order,
  isMembership,
  sessionCustomerEmail,
}: NotifyOrderCreatedProps): Promise<void> => {
  const [profile] = await adminDb
    .select()
    .from(profiles)
    .where(eq(profiles.id, order.userId))
    .limit(1)

  const addr = order.address
  const customerEmail = sessionCustomerEmail || profile?.email || null
  const customerName = profile?.fullName || addr.fullName || "Customer"
  const emailAddress = {
    street: addr.street || "",
    apt: addr.apt ?? undefined,
    city: addr.city || "",
    zip: addr.zip || "",
  }
  const itemCount = Array.isArray(order.items) ? order.items.length : 0
  const pickupMethod = order.pickupMethod || "hand"
  const isInstant = order.isInstant === true
  const pickupDate = String(order.pickupDate)

  if (customerEmail) {
    try {
      await sendOrderConfirmation({
        customerEmail,
        customerName,
        orderId: order.id,
        pickupDate,
        pickupTime: order.pickupTime,
        pickupMethod,
        address: emailAddress,
        itemCount,
        total: order.totalAmount,
        isInstant,
      })
    } catch (error) {
      log.error({ error, orderId: order.id }, "failed to send customer confirmation email")
    }
  }

  try {
    await sendAdminOrderNotification({
      orderId: order.id,
      customerName,
      customerEmail: customerEmail || "No email provided",
      customerPhone: addr.phone,
      pickupDate,
      pickupTime: order.pickupTime,
      pickupMethod,
      address: emailAddress,
      itemCount,
      total: order.totalAmount,
      isInstant,
    })
  } catch (error) {
    log.error({ error, orderId: order.id }, "failed to send admin notification email")
  }

  try {
    await sendSlackOrderNotification({
      order,
      profile: profile ?? null,
      customerEmail,
      isMembership,
    })
  } catch (error) {
    log.error({ error, orderId: order.id }, "failed to send slack notification")
  }
}
