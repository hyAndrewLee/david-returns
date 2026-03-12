import { z } from "zod"
import { createTRPCRouter } from "../init"
import { authedProcedure } from "../middlewares"
import { adminDb } from "@/server/db"
import { addresses } from "@/server/db/schema"
import { eq, desc, and } from "drizzle-orm"

export const addressesRouter = createTRPCRouter({
  list: authedProcedure.query(async ({ ctx }) => {
    return adminDb
      .select()
      .from(addresses)
      .where(eq(addresses.userId, ctx.user.id))
      .orderBy(desc(addresses.isDefault))
  }),

  getDefault: authedProcedure.query(async ({ ctx }) => {
    const [address] = await adminDb
      .select()
      .from(addresses)
      .where(and(eq(addresses.userId, ctx.user.id), eq(addresses.isDefault, true)))
      .limit(1)

    return address ?? null
  }),

  create: authedProcedure
    .input(
      z.object({
        label: z.string().optional(),
        fullName: z.string(),
        phone: z.string(),
        streetAddress: z.string(),
        apt: z.string().optional(),
        buildingName: z.string().optional(),
        city: z.string(),
        zip: z.string(),
        notes: z.string().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [address] = await adminDb
        .insert(addresses)
        .values({
          userId: ctx.user.id,
          label: input.label ?? "Home",
          fullName: input.fullName,
          phone: input.phone,
          streetAddress: input.streetAddress,
          apt: input.apt ?? null,
          buildingName: input.buildingName ?? null,
          city: input.city,
          zip: input.zip,
          notes: input.notes ?? null,
          isDefault: input.isDefault ?? false,
        })
        .returning()

      return address
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        fullName: z.string(),
        phone: z.string(),
        streetAddress: z.string(),
        apt: z.string().optional(),
        buildingName: z.string().optional(),
        city: z.string(),
        zip: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [address] = await adminDb
        .update(addresses)
        .set({
          fullName: input.fullName,
          phone: input.phone,
          streetAddress: input.streetAddress,
          apt: input.apt ?? null,
          buildingName: input.buildingName ?? null,
          city: input.city,
          zip: input.zip,
          notes: input.notes ?? null,
          updatedAt: new Date(),
        })
        .where(and(eq(addresses.id, input.id), eq(addresses.userId, ctx.user.id)))
        .returning()

      return address
    }),
})
