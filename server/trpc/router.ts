import { createTRPCRouter, createCallerFactory } from "./init"
import { authRouter } from "./routers/auth"
import { ordersRouter } from "./routers/orders"
import { addressesRouter } from "./routers/addresses"
import { adminRouter } from "./routers/admin"
import { stripeRouter } from "./routers/stripe"
import { uploadRouter } from "./routers/upload"
import { contactRouter } from "./routers/contact"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  orders: ordersRouter,
  addresses: addressesRouter,
  admin: adminRouter,
  stripe: stripeRouter,
  upload: uploadRouter,
  contact: contactRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
