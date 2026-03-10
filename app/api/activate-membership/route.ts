import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 })
    }

    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      })
    } catch (stripeError: unknown) {
      const message = stripeError instanceof Error ? stripeError.message : "Unknown Stripe error"
      return NextResponse.json({ error: `Stripe error: ${message}` }, { status: 500 })
    }

    if (session.mode !== "subscription" || !session.subscription) {
      return NextResponse.json({ error: "Not a subscription payment" }, { status: 400 })
    }

    const subscription = session.subscription as Stripe.Subscription
    const userId = session.metadata?.user_id

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 })
    }

    let supabase
    try {
      supabase = await createClient()
    } catch (supabaseError: unknown) {
      const message = supabaseError instanceof Error ? supabaseError.message : "Unknown database error"
      return NextResponse.json({ error: `Database connection error: ${message}` }, { status: 500 })
    }

    const { data: existingSub, error: checkError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (checkError) {
      // Error checking existing subscription
    }

    const subscriptionData = {
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      plan: "membership",
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }

    if (existingSub) {
      const { data: updatedSub, error: updateError } = await supabase
        .from("subscriptions")
        .update(subscriptionData)
        .eq("user_id", userId)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: `Failed to update subscription: ${updateError.message}` }, { status: 500 })
      }
    } else {
      const { data: insertedSub, error: insertError } = await supabase
        .from("subscriptions")
        .insert(subscriptionData)
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: `Failed to create subscription: ${insertError.message}` }, { status: 500 })
      }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: session.customer as string,
      })
      .eq("id", userId)

    if (session.metadata?.order_id) {
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "scheduled",
          tracking_status: "pending",
          stripe_payment_intent_id: subscription.id,
          total_amount: session.amount_total,
        })
        .eq("id", session.metadata.order_id)
    }

    return NextResponse.json({
      message: "Membership activated successfully!",
      subscription: {
        id: subscription.id,
        status: subscription.status,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: `Failed to activate membership: ${message}` }, { status: 500 })
  }
}
