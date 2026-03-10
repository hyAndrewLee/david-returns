"use server"

import { stripe } from "@/lib/stripe"
import { getProduct } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"

type CheckoutSessionData = {
  plan: "Pay-As-You-Go" | "Membership"
  itemCount: number
  isInstant: boolean
  pickupDate?: string
  pickupTime?: string
  pickupMethod?: string
  address?: {
    fullName: string
    phone: string
    street: string
    apt?: string
    city: string
    zip: string
    notes?: string
    pickupInstructions?: string
  }
  items?: Array<{
    labelType: string
    description: string
    retailer?: string
    packageSize?: string
    isBoxed?: boolean
    returnTo?: string
    returnToOther?: string
    labelFileUrl?: string
    photoUrl?: string
  }>
}

export async function createCheckoutSession(data: CheckoutSessionData) {
  try {
    if (!stripe) {
      return {
        success: false,
        error: "Stripe is not properly initialized. Please contact support.",
      }
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || ""
    const stripeMode = stripeKey.startsWith("sk_live_") ? "LIVE" : "TEST"
    const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
    const pubMode = pubKey.startsWith("pk_live_") ? "LIVE" : "TEST"
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""
    const webhookMode = webhookSecret.includes("_test_") ? "TEST" : "LIVE"

    if (stripeMode !== pubMode) {
      console.error("[v0] ⚠️  KEY MISMATCH! Secret and public keys are in different modes!")
    }

    let supabase
    try {
      supabase = await createClient()
    } catch (clientError) {
      return {
        success: false,
        error: "Unable to connect to database. Please try again.",
      }
    }

    let userData
    try {
      const result = await supabase.auth.getUser()
      userData = result.data

      if (result.error) {
        return {
          success: false,
          error: "Authentication failed. Please sign in again.",
        }
      }

      if (!userData?.user?.id) {
        return {
          success: false,
          error: "No user session found. Please sign in.",
        }
      }
    } catch (authError) {
      return {
        success: false,
        error: "Authentication check failed",
      }
    }

    const userId = userData.user.id
    const userEmail = userData.user.email

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, plan, stripe_subscription_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("plan", "membership")
      .maybeSingle()

    const hasActiveMembership = !!subscription

    let calculatedTotal = 0

    if (hasActiveMembership) {
      calculatedTotal = 0
    } else if (data.plan === "Membership") {
      const membership = getProduct("unlimited-membership")
      calculatedTotal = membership?.priceInCents || 1499
    } else {
      const basePickup = getProduct("pickup-base")
      const additionalItem = getProduct("additional-item")
      const instantFee = getProduct("instant-pickup")

      let total = basePickup?.priceInCents || 500

      if (data.itemCount > 1) {
        const additionalItems = data.itemCount - 1
        total += additionalItems * (additionalItem?.priceInCents || 200)
      }

      if (data.isInstant) {
        total += instantFee?.priceInCents || 150
      }

      calculatedTotal = total
    }

    const pickupDateValue = data.pickupDate || null

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", userId).single()

    const incomingCustomerId = profile?.stripe_customer_id
    let validatedCustomerId: string | null = null
    let useCustomerEmail = false

    if (incomingCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(incomingCustomerId)

        if (customer.deleted) {
          await supabase.from("profiles").update({ stripe_customer_id: null }).eq("id", userId)
        } else {
          validatedCustomerId = incomingCustomerId
        }
      } catch (customerError: unknown) {
        const err = customerError as { message?: string; code?: string; statusCode?: number; type?: string }
        const isModeError =
          err.message?.includes("similar object exists in live mode") ||
          err.message?.includes("similar object exists in test mode") ||
          err.code === "resource_missing" ||
          err.statusCode === 404 ||
          err.type === "StripeInvalidRequestError"

        if (isModeError) {
          console.log("[v0] Customer ID from different Stripe mode, clearing and will create new customer")
          try {
            await supabase.from("profiles").update({ stripe_customer_id: null }).eq("id", userId)
          } catch (dbError) {
            console.error("[v0] Failed to clear stale stripe_customer_id:", dbError)
          }
        } else {
          throw customerError
        }
      }
    }

    if (!validatedCustomerId) {
      try {
        const newCustomer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            user_id: userId,
            created_in_mode: stripeMode,
            created_at: new Date().toISOString(),
          },
        })
        validatedCustomerId = newCustomer.id

        await supabase.from("profiles").update({ stripe_customer_id: validatedCustomerId }).eq("id", userId)
      } catch (createError) {
        useCustomerEmail = true
      }
    }

    let lineItems: { price?: string; price_data?: { currency: string; unit_amount: number; product_data: { name: string; description: string } }; quantity: number }[] = []
    let mode: "subscription" | "payment" = "payment"

    if (hasActiveMembership) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          pickup_date: pickupDateValue,
          pickup_time: data.pickupTime,
          pickup_method: data.pickupMethod,
          address: data.address,
          items: data.items,
          is_instant: data.isInstant,
          total_amount: 0,
          status: "scheduled",
          tracking_status: "pending",
        })
        .select()
        .single()

      if (orderError) {
        return {
          success: false,
          error: `Failed to create order: ${orderError.message}`,
        }
      }

      return {
        success: true,
        free: true,
        orderId: order.id,
      }
    } else if (data.plan === "Membership") {
      mode = "subscription"

      try {
        const products = await stripe.products.list({
          active: true,
          limit: 100,
        })

        const membershipProduct = products.data.find(
          (p) => p.name === "Unlimited Membership" || p.metadata?.type === "membership",
        )

        let priceId: string

        if (membershipProduct) {
          const prices = await stripe.prices.list({
            product: membershipProduct.id,
            active: true,
            limit: 1,
          })

          if (prices.data.length > 0) {
            priceId = prices.data[0].id
          } else {
            const price = await stripe.prices.create({
              product: membershipProduct.id,
              currency: "usd",
              unit_amount: 1499,
              recurring: {
                interval: "month",
              },
            })
            priceId = price.id
          }
        } else {
          const product = await stripe.products.create({
            name: "Unlimited Membership",
            description: "Unlimited pickups per month",
            metadata: {
              type: "membership",
            },
          })

          const price = await stripe.prices.create({
            product: product.id,
            currency: "usd",
            unit_amount: 1499,
            recurring: {
              interval: "month",
            },
          })

          priceId = price.id
        }

        lineItems = [
          {
            price: priceId,
            quantity: 1,
          },
        ]
      } catch (stripeError) {
        return {
          success: false,
          error: "Failed to set up membership product in Stripe",
        }
      }
    } else {
      const basePickup = getProduct("pickup-base")
      const additionalItem = getProduct("additional-item")
      const instantFee = getProduct("instant-pickup")

      let total = basePickup?.priceInCents || 500

      if (data.itemCount > 1) {
        const additionalItems = data.itemCount - 1
        total += additionalItems * (additionalItem?.priceInCents || 200)
      }

      if (data.isInstant) {
        total += instantFee?.priceInCents || 150
      }

      calculatedTotal = total

      lineItems = [
        {
          price_data: {
            currency: "usd",
            unit_amount: calculatedTotal,
            product_data: {
              name: data.isInstant ? "Instant Pickup" : "One-Time Pickup",
              description: `Pickup on ${data.pickupDate} at ${data.pickupTime}`,
            },
          },
          quantity: 1,
        },
      ]
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        pickup_date: pickupDateValue,
        pickup_time: data.pickupTime,
        pickup_method: data.pickupMethod,
        address: data.address,
        items: data.items,
        is_instant: data.isInstant,
        total_amount: calculatedTotal,
        status: mode === "subscription" ? "pending_subscription" : "pending_payment",
        tracking_status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      console.error("[v0] Failed to create order in database:", orderError)
      return {
        success: false,
        error: `Failed to create order: ${orderError.message}`,
      }
    }

    console.log("[v0] Order created in database with ID:", order.id)

    try {
      const sessionParams = {
        ui_mode: "embedded" as const,
        return_url: `${baseUrl}/schedule/return?session_id={CHECKOUT_SESSION_ID}`,
        line_items: lineItems,
        mode: mode,
        metadata: {
          user_id: userId,
          order_id: order.id,
          plan: data.plan,
          is_instant: data.isInstant ? "true" : "false",
          item_count: data.itemCount.toString(),
          total_amount: calculatedTotal.toString(),
        },
        ...(validatedCustomerId && !useCustomerEmail
          ? { customer: validatedCustomerId }
          : { customer_email: userEmail }),
      }

      const session = await stripe.checkout.sessions.create(sessionParams)

      if (!session.client_secret) {
        return {
          success: false,
          error: "Failed to initialize payment session. Please try again.",
        }
      }

      return {
        success: true,
        clientSecret: session.client_secret,
      }
    } catch (sessionError) {
      await supabase
        .from("orders")
        .update({
          status: "payment_failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      return {
        success: false,
        error: sessionError instanceof Error ? sessionError.message : "Failed to create checkout session",
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred during checkout",
    }
  }
}

export async function checkMembershipStatus() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user?.id) {
    return { isMember: false, user: null }
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan, current_period_end, stripe_subscription_id")
    .eq("user_id", userData.user.id)
    .eq("status", "active")
    .eq("plan", "membership")
    .maybeSingle()

  return {
    isMember: !!subscription,
    user: userData.user,
    subscription,
  }
}

export async function cancelMembership() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user?.id) {
    throw new Error("Not authenticated")
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", userData.user.id)
    .eq("status", "active")
    .eq("plan", "membership")
    .maybeSingle()

  if (!subscription?.stripe_subscription_id) {
    throw new Error("No active membership found")
  }

  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  await supabase
    .from("subscriptions")
    .update({
      status: "canceling",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.stripe_subscription_id)

  return { success: true }
}
