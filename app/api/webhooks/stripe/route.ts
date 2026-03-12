import { NextResponse } from "next/server"
import Stripe from "stripe"
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/server/services/email"
import { adminDb } from "@/server/db"
import { orders, profiles, subscriptions } from "@/server/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const POST = async (request: Request) => {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
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
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata

        if (metadata?.user_id && metadata?.order_id) {
          const [existingOrder] = await adminDb
            .select()
            .from(orders)
            .where(eq(orders.id, metadata.order_id))
            .limit(1)

          if (existingOrder?.stripeSessionId === session.id) {
            return NextResponse.json({ received: true, skipped: true })
          }

          const totalAmount = metadata.total_amount
            ? parseInt(metadata.total_amount)
            : session.amount_total || 0

          const [order] = await adminDb
            .update(orders)
            .set({
              status: "scheduled",
              trackingStatus: "pending",
              stripeSessionId: session.id,
              stripePaymentIntentId: (session.payment_intent as string) || (session.subscription as string),
              totalAmount,
            })
            .where(eq(orders.id, metadata.order_id))
            .returning()

          try {
            const [profile] = await adminDb
              .select()
              .from(profiles)
              .where(eq(profiles.id, metadata.user_id))
              .limit(1)

            const customerEmail = session.customer_email || profile?.email
            const customerName = profile?.fullName || (order.address as any)?.fullName || "Customer"

            if (customerEmail) {
              await sendOrderConfirmation({
                customerEmail,
                customerName,
                orderId: order.id,
                pickupDate: String(order.pickupDate),
                pickupTime: order.pickupTime,
                pickupMethod: order.pickupMethod || "hand",
                address: {
                  street: (order.address as any)?.street || "",
                  apt: (order.address as any)?.apt,
                  city: (order.address as any)?.city || "",
                  zip: (order.address as any)?.zip || "",
                },
                itemCount: Array.isArray(order.items) ? order.items.length : 0,
                total: totalAmount,
                isInstant: order.isInstant === true,
              })
            }

            try {
              await sendAdminOrderNotification({
                orderId: order.id,
                customerName,
                customerEmail: customerEmail || "No email provided",
                customerPhone: (order.address as any)?.phone,
                pickupDate: String(order.pickupDate),
                pickupTime: order.pickupTime,
                pickupMethod: order.pickupMethod || "hand",
                address: {
                  street: (order.address as any)?.street || "",
                  apt: (order.address as any)?.apt,
                  city: (order.address as any)?.city || "",
                  zip: (order.address as any)?.zip || "",
                },
                itemCount: Array.isArray(order.items) ? order.items.length : 0,
                total: totalAmount,
                isInstant: metadata.is_instant === "true",
              })
            } catch (adminEmailError) {
              console.error("Failed to send admin notification:", adminEmailError)
            }
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError)
          }

          if (session.mode === "subscription" && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

            const [existingSub] = await adminDb
              .select({ id: subscriptions.id })
              .from(subscriptions)
              .where(eq(subscriptions.userId, metadata.user_id))
              .limit(1)

            const subscriptionData = {
              userId: metadata.user_id,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              plan: "membership",
              currentPeriodStart: new Date(((subscription as any).current_period_start ?? Math.floor(Date.now() / 1000)) * 1000),
              currentPeriodEnd: new Date(((subscription as any).current_period_end ?? Math.floor(Date.now() / 1000)) * 1000),
              updatedAt: new Date(),
            }

            if (existingSub) {
              await adminDb
                .update(subscriptions)
                .set(subscriptionData)
                .where(eq(subscriptions.id, existingSub.id))
            } else {
              await adminDb.insert(subscriptions).values(subscriptionData)
            }

            await adminDb
              .update(profiles)
              .set({
                stripeSubscriptionId: session.subscription as string,
                stripeCustomerId: session.customer as string,
              })
              .where(eq(profiles.id, metadata.user_id))
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        await adminDb
          .update(subscriptions)
          .set({
            status: subscription.status,
            currentPeriodStart: new Date(((subscription as any).current_period_start ?? Math.floor(Date.now() / 1000)) * 1000),
            currentPeriodEnd: new Date(((subscription as any).current_period_end ?? Math.floor(Date.now() / 1000)) * 1000),
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

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Fatal error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
