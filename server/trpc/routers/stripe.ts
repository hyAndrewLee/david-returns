import { z } from "zod"
import Stripe from "stripe"
import { createTRPCRouter } from "../init"
import { authedProcedure } from "../middlewares"
import { stripe } from "@/server/services/stripe"
import { encodeOrderMetadata } from "@/server/services/stripeMetadata"
import { fulfillCheckout } from "@/server/services/fulfillment"
import { notifyOrderCreated } from "@/server/services/orderNotifications"
import { adminDb } from "@/server/db"
import { orders, subscriptions, profiles } from "@/server/db/schema"
import { eq, and } from "drizzle-orm"
import { getProduct } from "@/lib/constants"
import { createLogger } from "@/lib/logger"

const log = createLogger("stripe-router")

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
        discountCode: z.string().optional(),
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

      log.info({ userId, plan: input.plan, itemCount: input.itemCount, isInstant: input.isInstant }, "createCheckout started")

      const VALID_DISCOUNT_CODES: Record<string, number> = {
        DOGFOODR: 100,
      }

      const discountPct = input.discountCode
        ? VALID_DISCOUNT_CODES[input.discountCode.trim().toUpperCase()] ?? 0
        : 0

      if (input.discountCode && discountPct === 0) {
        return { success: false, error: "Invalid discount code" }
      }

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

      if (discountPct > 0) {
        calculatedTotal = Math.round(calculatedTotal * (1 - discountPct / 100))
      }

      if (calculatedTotal === 0 && !hasActiveMembership) {
        log.info({ userId, discountCode: input.discountCode }, "discount code applied — creating free order")

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
            },
          ])
          .returning()

        await notifyOrderCreated({
          order,
          isMembership: false,
          sessionCustomerEmail: userEmail,
        })

        return { success: true, free: true, orderId: order.id }
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
          if (!(customer as unknown as Record<string, unknown>).deleted) {
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
            },
          ])
          .returning()

        log.info({ userId, orderId: order.id }, "member order — no payment required")

        await notifyOrderCreated({
          order,
          isMembership: true,
          sessionCustomerEmail: userEmail,
        })

        return { success: true, free: true, orderId: order.id }
      }

      let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
      let mode: "subscription" | "payment" = "payment"

      if (input.plan === "Membership") {
        mode = "subscription"
        const expectedAmount = getProduct("unlimited-membership")?.priceInCents || 2299
        const products = await stripe.products.list({ active: true, limit: 100 })
        const membershipProduct = products.data.find(
          (p) => p.name === "Unlimited Membership" || p.metadata?.type === "membership",
        )

        let priceId: string

        if (membershipProduct) {
          const prices = await stripe.prices.list({ product: membershipProduct.id, active: true, limit: 10 })
          const correctPrice = prices.data.find(
            (p) => p.unit_amount === expectedAmount && p.recurring?.interval === "month",
          )

          if (correctPrice) {
            priceId = correctPrice.id
          } else {
            for (const oldPrice of prices.data) {
              if (oldPrice.unit_amount !== expectedAmount) {
                await stripe.prices.update(oldPrice.id, { active: false })
                log.info({ oldPriceId: oldPrice.id, oldAmount: oldPrice.unit_amount, newAmount: expectedAmount }, "deactivated stale membership price")
              }
            }
            const price = await stripe.prices.create({
              product: membershipProduct.id,
              currency: "usd",
              unit_amount: expectedAmount,
              recurring: { interval: "month" },
            })
            priceId = price.id
            log.info({ priceId, amount: expectedAmount }, "created new membership price")
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
            unit_amount: expectedAmount,
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

      const metadata = encodeOrderMetadata({
        userId,
        plan: input.plan,
        isInstant: input.isInstant,
        itemCount: input.itemCount,
        totalAmount: calculatedTotal,
        pickupDate: input.pickupDate || new Date().toISOString().split("T")[0],
        pickupTime: input.pickupTime || "",
        pickupMethod: input.pickupMethod || "",
        address: input.address ?? {},
        items: input.items ?? [],
      })

      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        return_url: `${baseUrl}/schedule/return?session_id={CHECKOUT_SESSION_ID}`,
        line_items: lineItems,
        mode,
        metadata,
        ...(mode === "payment" && {
          invoice_creation: {
            enabled: true,
            invoice_data: {
              description: input.isInstant
                ? `Instant pickup scheduled for ${input.pickupDate || "scheduled date"}`
                : `Pickup scheduled for ${input.pickupDate || "scheduled date"}`,
              metadata: {
                user_id: userId,
                order_type: input.isInstant ? "instant_pickup" : "pickup",
                pickup_date: input.pickupDate || "",
                pickup_time: input.pickupTime || "",
              },
              footer: "Thanks for using David Returns. Reply to this email or contact hello@davidreturns.com with any questions.",
            },
          },
        }),
        ...(validatedCustomerId && !useCustomerEmail
          ? { customer: validatedCustomerId }
          : { customer_email: userEmail }),
      })

      if (!session.client_secret) {
        log.error({ sessionId: session.id, userId }, "checkout session missing client_secret")
        return { success: false, error: "Failed to initialize payment session." }
      }

      log.info({ sessionId: session.id, mode, userId }, "checkout session created")
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

  finalizeCheckout: authedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      log.info({ sessionId: input.sessionId, userId: ctx.user.id }, "finalizeCheckout called")

      const result = await fulfillCheckout(input.sessionId)

      if (!result.success) {
        log.error({ sessionId: input.sessionId, error: result.error }, "finalizeCheckout failed")
        return { error: result.error || "Failed to finalize checkout" }
      }

      if (result.alreadyFulfilled) {
        log.info({ sessionId: input.sessionId, orderId: result.orderId }, "finalizeCheckout: already fulfilled")
      }

      const message = result.isMembership
        ? "Membership activated successfully!"
        : "Payment successful! Your pickup has been scheduled."

      return { message, orderId: result.orderId }
    }),
})
