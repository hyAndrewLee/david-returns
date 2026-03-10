import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email"
import { debugLog, debugError } from "@/lib/debug"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    debugError("Webhook error: No signature found")
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    debugError("CRITICAL: STRIPE_WEBHOOK_SECRET not configured")
    // In development, allow bypass only if explicitly enabled
    if (process.env.NODE_ENV === "production" || process.env.ENFORCE_WEBHOOK_SECRET === "true") {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    debugLog("Webhook signature verified successfully")
  } catch (err) {
    debugError("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  debugLog("Stripe webhook received:", event.type)
  debugLog("Event ID:", event.id)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata
        const address = session.customer_details?.address
        const items = session.display_items

        debugLog("===== CHECKOUT SESSION COMPLETED =====")
        debugLog("Session ID:", session.id)
        debugLog("Customer:", session.customer)
        debugLog("Subscription:", session.subscription)
        debugLog("Mode:", session.mode)
        debugLog("Amount total:", session.amount_total, "cents")
        debugLog("Metadata:", JSON.stringify(metadata, null, 2))

        if (metadata?.user_id && metadata?.order_id) {
          debugLog("Updating order after successful payment, order ID:", metadata.order_id)

          try {
            // Check if this webhook was already processed (idempotency)
            const { data: existingOrder } = await supabaseAdmin
              .from("orders")
              .select("id, status, stripe_session_id")
              .eq("id", metadata.order_id)
              .single()

            if (existingOrder?.stripe_session_id === session.id) {
              debugLog("Webhook already processed for this session, skipping")
              return NextResponse.json({ received: true, skipped: true })
            }

            const totalAmount = metadata.total_amount
              ? Number.parseInt(metadata.total_amount)
              : session.amount_total || 0

            // Update the existing order in database
            const { data: order, error: orderError } = await supabaseAdmin
              .from("orders")
              .update({
                status: "scheduled",
                tracking_status: "pending",
                stripe_session_id: session.id,
                stripe_payment_intent_id: (session.payment_intent as string) || (session.subscription as string),
                total_amount: totalAmount,
              })
              .eq("id", metadata.order_id)
              .select()
              .single()

            if (orderError) {
              debugError("Error updating order:", orderError)
              throw orderError
            }

            debugLog("Order updated successfully with ID:", order.id)

            // Send confirmation email
            try {
              const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("email, full_name")
                .eq("id", metadata.user_id)
                .single()

              // Fetch order items to get accurate count
              const { data: orderItems } = await supabaseAdmin
                .from("order_items")
                .select("*")
                .eq("order_id", order.id)

              const customerEmail = session.customer_email || profile?.email
              const customerName = profile?.full_name || order.address?.fullName || "Customer"

              if (customerEmail) {
                debugLog("Sending order confirmation email to:", customerEmail)
                await sendOrderConfirmation({
                  customerEmail,
                  customerName,
                  orderId: order.id,
                  pickupDate: order.pickup_date,
                  pickupTime: order.pickup_time,
                  pickupMethod: order.pickup_method || "hand",
                  address: {
                    street: order.address?.street || "",
                    apt: order.address?.apt,
                    city: order.address?.city || "",
                    zip: order.address?.zip || "",
                  },
                  itemCount: orderItems?.length || 0,
                  total: totalAmount,
                  isInstant: order.is_instant === true,
                })
                debugLog("Order confirmation email sent successfully")
              }

              // Send admin notification
              try {
                debugLog("Sending admin notification email")
                await sendAdminOrderNotification({
                  orderId: order.id,
                  customerName,
                  customerEmail: customerEmail || "No email provided",
                  customerPhone: order.address?.phone,
                  pickupDate: order.pickup_date,
                  pickupTime: order.pickup_time,
                  pickupMethod: order.pickup_method || "hand",
                  address: {
                    street: order.address?.street || "",
                    apt: order.address?.apt,
                    city: order.address?.city || "",
                    zip: order.address?.zip || "",
                  },
                  itemCount: orderItems?.length || 0,
                  total: totalAmount,
                  isInstant: metadata.is_instant === "true",
                })
                debugLog("Admin notification email sent successfully")
              } catch (adminEmailError) {
                debugError("Failed to send admin notification (non-critical):", adminEmailError)
              }
            } catch (emailError) {
              debugError("Failed to send confirmation email:", emailError)
            }

            // Process membership if applicable
            if (session.mode === "subscription" && session.subscription) {
              debugLog("===== PROCESSING MEMBERSHIP =====")
              debugLog("User ID:", metadata.user_id)
              debugLog("Subscription ID:", session.subscription)

              try {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
                debugLog("Retrieved subscription from Stripe:")
                debugLog("  - ID:", subscription.id)
                debugLog("  - Status:", subscription.status)
                debugLog("  - Customer:", subscription.customer)
                debugLog("  - Current period start:", new Date(subscription.current_period_start * 1000).toISOString())
                debugLog("  - Current period end:", new Date(subscription.current_period_end * 1000).toISOString())

                const { data: existingSub, error: checkError } = await supabaseAdmin
                  .from("subscriptions")
                  .select("id")
                  .eq("user_id", metadata.user_id)
                  .eq("stripe_subscription_id", subscription.id)
                  .maybeSingle()

                if (checkError) {
                  debugError("Error checking for existing subscription:", checkError)
                  throw checkError
                }

                if (existingSub) {
                  debugLog("Subscription already exists, updating:", existingSub.id)
                  const { error: updateError } = await supabaseAdmin
                    .from("subscriptions")
                    .update({
                      status: subscription.status,
                      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", existingSub.id)

                  if (updateError) {
                    debugError("Error updating subscription:", updateError)
                    throw updateError
                  }
                  debugLog("Subscription updated successfully")
                } else {
                  debugLog("Creating new subscription record")
                  const subscriptionData = {
                    user_id: metadata.user_id,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: subscription.id,
                    status: subscription.status,
                    plan: "membership",
                    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }

                  debugLog("Inserting subscription data:", JSON.stringify(subscriptionData, null, 2))

                  const { data: newSub, error: insertError } = await supabaseAdmin
                    .from("subscriptions")
                    .insert(subscriptionData)
                    .select()
                    .single()

                  if (insertError) {
                    debugError("Error inserting subscription:", insertError)
                    debugError("Error details:", JSON.stringify(insertError, null, 2))
                    throw insertError
                  }
                  debugLog("Subscription created successfully with ID:", newSub.id)
                }

                debugLog("Updating profile with Stripe IDs")
                const { error: profileError } = await supabaseAdmin
                  .from("profiles")
                  .update({
                    stripe_subscription_id: session.subscription as string,
                    stripe_customer_id: session.customer as string,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", metadata.user_id)

                if (profileError) {
                  debugError("Error updating profile:", profileError)
                } else {
                  debugLog("Profile updated successfully")
                }

                debugLog("===== MEMBERSHIP ACTIVATED =====")
              } catch (err) {
                debugError("Error processing subscription:", err)
                throw err
              }
            } else {
              debugLog("Not a membership order, skipping subscription processing")
            }
          } catch (orderCreationError) {
            debugError("Fatal error creating order:", orderCreationError)
            throw orderCreationError
          }
        } else {
          debugLog("No user_id in metadata, cannot create order")
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        debugLog("Subscription updated:", subscription.id, "status:", subscription.status)

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (error) {
          debugError("Error updating subscription:", error)
          throw error
        }
        debugLog("Subscription status updated successfully")
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        debugLog("Subscription cancelled:", subscription.id)

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (error) {
          debugError("Error cancelling subscription:", error)
          throw error
        }
        debugLog("Subscription marked as cancelled successfully")
        break
      }

      default:
        debugLog("Unhandled event type:", event.type)
    }

    debugLog("Webhook processed successfully")
    return NextResponse.json({ received: true })
  } catch (error) {
    debugError("Fatal error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
