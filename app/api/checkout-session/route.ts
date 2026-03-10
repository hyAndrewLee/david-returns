import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      id: session.id,
      mode: session.mode,
      payment_status: session.payment_status,
      customer: session.customer,
      metadata: session.metadata,
    })
  } catch (error: any) {
    console.error("[v0] Error retrieving checkout session:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
