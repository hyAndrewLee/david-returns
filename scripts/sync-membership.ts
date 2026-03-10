import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function syncMemberships() {
  console.log("Starting membership sync...")

  // Get all orders with $14.99 amount that don't have a corresponding subscription
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, stripe_payment_intent_id, total_amount, created_at")
    .eq("total_amount", 1499) // $14.99 in cents
    .order("created_at", { ascending: false })

  if (ordersError) {
    console.error("Error fetching orders:", ordersError)
    return
  }

  console.log(`Found ${orders?.length || 0} orders with $14.99 amount`)

  for (const order of orders || []) {
    console.log(`\nChecking order ${order.id} for user ${order.user_id}`)

    // Check if user already has a subscription
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", order.user_id)
      .single()

    if (existingSub && existingSub.status === "active") {
      console.log(`User ${order.user_id} already has active subscription`)
      continue
    }

    // Try to find the Stripe subscription
    try {
      // Get the payment intent to find the customer
      if (order.stripe_payment_intent_id) {
        let customerId: string | null = null
        let subscriptionId: string | null = null

        // Check if it's a subscription ID (starts with sub_)
        if (order.stripe_payment_intent_id.startsWith("sub_")) {
          subscriptionId = order.stripe_payment_intent_id
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          customerId = subscription.customer as string
          console.log(`Found subscription ${subscriptionId} for customer ${customerId}`)

          // Create subscription record
          const { error: subError } = await supabaseAdmin.from("subscriptions").insert({
            user_id: order.user_id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            plan: "membership",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (subError) {
            console.error(`Error creating subscription for user ${order.user_id}:`, subError)
          } else {
            console.log(`✅ Created subscription for user ${order.user_id}`)

            // Update profile
            await supabaseAdmin
              .from("profiles")
              .update({
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: customerId,
              })
              .eq("id", order.user_id)
          }
        } else {
          console.log(`Payment intent ${order.stripe_payment_intent_id} is not a subscription`)
        }
      }
    } catch (err) {
      console.error(`Error processing order ${order.id}:`, err)
    }
  }

  console.log("\nSync complete!")
}

syncMemberships()
