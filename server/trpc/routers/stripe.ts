import { z } from "zod"
import { createTRPCRouter } from "../init"
import { authedProcedure } from "../middlewares"
import { stripe } from "@/server/services/stripe"
import { adminDb } from "@/server/db"
import { orders, subscriptions, profiles } from "@/server/db/schema"
import { eq, and } from "drizzle-orm"
import { getProduct } from "@/lib/constants"

export const stripeRouter = createTRPCRouter({
  createCheckout: authedProcedure
    .input(
      z.object({
        plan: z.enum(["Pay-As-You-Go", "Membership"]),
        itemCount: z.number(),
        isInstant: z.boolean(),
        pickupDate: z.string().optional(),
        pickupTime: z.string().optional(),
        pickupMethod: z.string().optional(),
        address: z
          .object({
            fullName: z.string(),
            phone: z.string(),
            street: z.string(),
            apt: z.string().optional(),
            city: z.string(),
            zip: z.string(),
            notes: z.string().optional(),
            pickupInstructions: z.string().optional(),
          })
          .optional(),
        items: z
          .array(
            z.object({
              labelType: z.string(),
              description: z.string(),
              retailer: z.string().optional(),
              packageSize: z.string().optional(),
              isBoxed: z.boolean().optional(),
              returnTo: z.string().optional(),
              returnToOther: z.string().optional(),
              labelFileUrl: z.string().optional(),
              photoUrl: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id
      const userEmail = ctx.user.email

      const [sub] = await adminDb
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, "active"),
            eq(subscriptions.plan, "membership"),
          ),
        )
        .limit(1)

      const hasActiveMembership = !!sub
      let calculatedTotal = 0

      if (hasActiveMembership) {
        calculatedTotal = 0
      } else if (input.plan === "Membership") {
        const membership = getProduct("unlimited-membership")
        calculatedTotal = membership?.priceInCents || 2299
      } else {
        const basePickup = getProduct("pickup-base")
        const additionalItem = getProduct("additional-item")
        const instantFee = getProduct("instant-pickup")

        let total = basePickup?.priceInCents || 799
        if (input.itemCount > 1) {
          total += (input.itemCount - 1) * (additionalItem?.priceInCents || 100)
        }
        if (input.isInstant) {
          total += instantFee?.priceInCents || 150
        }
        calculatedTotal = total
      }

      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

      const [profile] = await adminDb
        .select({ stripeCustomerId: profiles.stripeCustomerId })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1)

      let validatedCustomerId: string | null = null
      let useCustomerEmail = false

      if (profile?.stripeCustomerId) {
        try {
          const customer = await stripe.customers.retrieve(profile.stripeCustomerId)
          if (!(customer as any).deleted) {
            validatedCustomerId = profile.stripeCustomerId
          } else {
            await adminDb.update(profiles).set({ stripeCustomerId: null }).where(eq(profiles.id, userId))
          }
        } catch {
          await adminDb.update(profiles).set({ stripeCustomerId: null }).where(eq(profiles.id, userId))
        }
      }

      if (!validatedCustomerId) {
        try {
          const newCustomer = await stripe.customers.create({
            email: userEmail,
            metadata: { user_id: userId },
          })
          validatedCustomerId = newCustomer.id
          await adminDb.update(profiles).set({ stripeCustomerId: validatedCustomerId }).where(eq(profiles.id, userId))
        } catch {
          useCustomerEmail = true
        }
      }

      if (hasActiveMembership) {
        const [order] = await adminDb
          .insert(orders)
          .values([
            {
              userId,
              pickupDate: input.pickupDate || new Date().toISOString().split("T")[0],
              pickupTime: input.pickupTime || "",
              pickupMethod: input.pickupMethod,
              address: input.address ?? {},
              items: input.items ?? [],
              isInstant: input.isInstant,
              totalAmount: 0,
              status: "scheduled",
              trackingStatus: "pending",
            },
          ])
          .returning()

        return { success: true, free: true, orderId: order.id }
      }

      let lineItems: any[] = []
      let mode: "subscription" | "payment" = "payment"

      if (input.plan === "Membership") {
        mode = "subscription"
        const products = await stripe.products.list({ active: true, limit: 100 })
        const membershipProduct = products.data.find(
          (p) => p.name === "Unlimited Membership" || p.metadata?.type === "membership",
        )

        let priceId: string

        if (membershipProduct) {
          const prices = await stripe.prices.list({ product: membershipProduct.id, active: true, limit: 1 })
          if (prices.data.length > 0) {
            priceId = prices.data[0].id
          } else {
            const price = await stripe.prices.create({
              product: membershipProduct.id,
              currency: "usd",
              unit_amount: 2299,
              recurring: { interval: "month" },
            })
            priceId = price.id
          }
        } else {
          const product = await stripe.products.create({
            name: "Unlimited Membership",
            description: "Unlimited pickups per month",
            metadata: { type: "membership" },
          })
          const price = await stripe.prices.create({
            product: product.id,
            currency: "usd",
            unit_amount: 2299,
            recurring: { interval: "month" },
          })
          priceId = price.id
        }

        lineItems = [{ price: priceId, quantity: 1 }]
      } else {
        lineItems = [
          {
            price_data: {
              currency: "usd",
              unit_amount: calculatedTotal,
              product_data: {
                name: input.isInstant ? "Instant Pickup" : "One-Time Pickup",
                description: `Pickup on ${input.pickupDate} at ${input.pickupTime}`,
              },
            },
            quantity: 1,
          },
        ]
      }

      const [order] = await adminDb
        .insert(orders)
        .values([
          {
            userId,
            pickupDate: input.pickupDate || new Date().toISOString().split("T")[0],
            pickupTime: input.pickupTime || "",
            pickupMethod: input.pickupMethod,
            address: input.address ?? {},
            items: input.items ?? [],
            isInstant: input.isInstant,
            totalAmount: calculatedTotal,
            status: mode === "subscription" ? "pending_subscription" : "pending_payment",
            trackingStatus: "pending",
          },
        ])
        .returning()

      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        return_url: `${baseUrl}/schedule/return?session_id={CHECKOUT_SESSION_ID}`,
        line_items: lineItems,
        mode,
        metadata: {
          user_id: userId,
          order_id: order.id,
          plan: input.plan,
          is_instant: input.isInstant ? "true" : "false",
          item_count: input.itemCount.toString(),
          total_amount: calculatedTotal.toString(),
        },
        ...(validatedCustomerId && !useCustomerEmail
          ? { customer: validatedCustomerId }
          : { customer_email: userEmail }),
      })

      if (!session.client_secret) {
        return { success: false, error: "Failed to initialize payment session." }
      }

      return { success: true, clientSecret: session.client_secret }
    }),

  checkMembership: authedProcedure.query(async ({ ctx }) => {
    const [sub] = await adminDb
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, ctx.user.id),
          eq(subscriptions.status, "active"),
          eq(subscriptions.plan, "membership"),
        ),
      )
      .limit(1)

    return { isMember: !!sub, subscription: sub ?? null }
  }),

  cancelMembership: authedProcedure.mutation(async ({ ctx }) => {
    const [sub] = await adminDb
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, ctx.user.id),
          eq(subscriptions.status, "active"),
          eq(subscriptions.plan, "membership"),
        ),
      )
      .limit(1)

    if (!sub?.stripeSubscriptionId) {
      throw new Error("No active membership found")
    }

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })

    await adminDb
      .update(subscriptions)
      .set({ status: "canceling", updatedAt: new Date() })
      .where(eq(subscriptions.stripeSubscriptionId, sub.stripeSubscriptionId))

    return { success: true }
  }),

  getCheckoutSession: authedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId)

      return {
        id: session.id,
        mode: session.mode,
        paymentStatus: session.payment_status,
        customer: session.customer,
        metadata: session.metadata,
      }
    }),

  activateMembership: authedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
        expand: ["subscription"],
      })

      if (session.mode !== "subscription" || !session.subscription) {
        return { error: "Not a subscription payment" }
      }

      const subscription = session.subscription as any
      const userId = session.metadata?.user_id
      if (!userId) return { error: "User ID not found" }

      const [existingSub] = await adminDb
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1)

      const subscriptionData = {
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        plan: "membership",
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      }

      if (existingSub) {
        await adminDb.update(subscriptions).set(subscriptionData).where(eq(subscriptions.userId, userId))
      } else {
        await adminDb.insert(subscriptions).values(subscriptionData)
      }

      await adminDb
        .update(profiles)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: session.customer as string,
        })
        .where(eq(profiles.id, userId))

      if (session.metadata?.order_id) {
        await adminDb
          .update(orders)
          .set({
            status: "scheduled",
            trackingStatus: "pending",
            stripePaymentIntentId: subscription.id,
            totalAmount: session.amount_total ?? 0,
          })
          .where(eq(orders.id, session.metadata.order_id))
      }

      return { message: "Membership activated successfully!", subscriptionId: subscription.id }
    }),
})
