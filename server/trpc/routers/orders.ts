import { z } from "zod"
import { createTRPCRouter } from "../init"
import { authedProcedure, adminProcedure } from "../middlewares"
import { adminDb } from "@/server/db"
import { orders, profiles } from "@/server/db/schema"
import { eq, desc, inArray } from "drizzle-orm"
import { ORDER_STATUSES } from "@/lib/constants"

export const ordersRouter = createTRPCRouter({
  list: authedProcedure.query(async ({ ctx }) => {
    return adminDb
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(desc(orders.createdAt))
  }),

  getById: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [order] = await adminDb
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1)

      if (!order || order.userId !== ctx.user.id) {
        return null
      }

      return order
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string(),
        address: z.string(),
        apt: z.string().optional(),
        buildingName: z.string().optional(),
        city: z.string(),
        zip: z.string(),
        retailer: z.string().optional(),
        itemsDescription: z.string().optional(),
        returnType: z.string().optional(),
        preferredDate: z.string(),
        timeWindow: z.string(),
        notes: z.string().optional(),
        pickupInstructions: z.string().optional(),
        plan: z.string(),
        numPackages: z.number(),
        serviceType: z.string(),
        pickupMethod: z.string().optional(),
        itemsDetails: z.array(z.record(z.unknown())).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [order] = await adminDb
        .insert(orders)
        .values({
          userId: ctx.user.id,
          status: "scheduled",
          pickupDate: input.preferredDate,
          pickupTime: input.timeWindow,
          pickupMethod: input.pickupMethod || "hand-to-me",
          isInstant: input.serviceType === "Instant",
          address: {
            fullName: input.name.trim(),
            phone: input.phone.trim(),
            street: input.address.trim(),
            apt: input.apt || null,
            buildingName: input.buildingName || null,
            city: input.city.trim(),
            zip: input.zip.trim(),
            notes: input.notes?.trim() || null,
            pickupInstructions: input.pickupInstructions?.trim() || null,
          },
          items: input.itemsDetails || [],
          totalAmount: input.plan === "Pay-As-You-Go" ? 799 + Math.max(0, input.numPackages - 1) * 100 : 0,
        })
        .returning()

      return order
    }),

  adminList: adminProcedure.query(async () => {
    const allOrders = await adminDb
      .select()
      .from(orders)
      .where(inArray(orders.status, [...ORDER_STATUSES]))
      .orderBy(desc(orders.createdAt))

    const allProfiles = await adminDb.select().from(profiles).orderBy(desc(profiles.createdAt))

    return allOrders.map((order) => ({
      ...order,
      profiles: allProfiles.find((p) => p.id === order.userId) ?? null,
    }))
  }),

  adminGetById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [order] = await adminDb
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1)

      if (!order) return null

      let userProfile = null
      if (order.userId) {
        const [profile] = await adminDb
          .select()
          .from(profiles)
          .where(eq(profiles.id, order.userId))
          .limit(1)
        userProfile = profile ?? null
      }

      return { ...order, profiles: userProfile }
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(ORDER_STATUSES),
      }),
    )
    .mutation(async ({ input }) => {
      await adminDb
        .update(orders)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId))

      return { success: true }
    }),

  updateNotes: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        adminNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await adminDb
        .update(orders)
        .set({
          adminNotes: input.adminNotes,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId))

      return { success: true }
    }),

  delete: adminProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      await adminDb.delete(orders).where(eq(orders.id, input.orderId))
      return { success: true }
    }),

  bulkDelete: adminProcedure
    .input(z.object({ orderIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      await adminDb.delete(orders).where(inArray(orders.id, input.orderIds))
      return { success: true }
    }),
})
