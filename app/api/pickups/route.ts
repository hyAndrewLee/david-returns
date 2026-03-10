import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const GET = async () => {
  try {
    const supabase = await createClient()

    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error("[v0] Unexpected error in GET /api/pickups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log("[v0] Creating new order with data:", JSON.stringify(body, null, 2))

    // Validation
    const errors: string[] = []

    if (!body.name?.trim()) errors.push("Name is required")
    if (!body.email?.trim()) errors.push("Email is required")
    if (!body.phone?.trim()) errors.push("Phone is required")
    if (!body.address?.trim()) errors.push("Address is required")
    if (!body.city?.trim()) errors.push("City is required")
    if (!body.zip?.trim()) errors.push("ZIP code is required")
    if (!body.preferredDate) errors.push("Preferred date is required")
    if (!body.timeWindow) errors.push("Time window is required")
    if (!body.plan) errors.push("Plan is required")
    if (!body.serviceType) errors.push("Service type is required")

    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push("Invalid email format")
    }

    if (body.plan === "Pay-As-You-Go") {
      if (!body.numPackages || body.numPackages < 1) {
        errors.push("Number of packages is required for Pay-As-You-Go plan")
      }
    }

    if (errors.length > 0) {
      console.log("[v0] Validation failed:", errors)
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 })
    }

    // Get user ID from session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No authenticated user found")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    const orderData = {
      user_id: user.id,
      status: "pending",
      pickup_date: body.preferredDate,
      pickup_time: body.timeWindow,
      pickup_method: body.pickupMethod || "hand-to-me",
      is_instant: body.serviceType === "Instant",
      address: {
        fullName: body.name.trim(),
        phone: body.phone.trim(),
        street: body.address.trim(),
        apt: body.apt || null,
        buildingName: body.buildingName || null,
        city: body.city.trim(),
        zip: body.zip.trim(),
        notes: body.notes?.trim() || null,
        pickupInstructions: body.pickupInstructions?.trim() || null,
      },
      items: body.itemsDetails || [],
      total_amount: body.plan === "Pay-As-You-Go" ? (body.numPackages || 0) * 500 : 0, // $5 per package in cents
    }

    console.log("[v0] Inserting order into database:", JSON.stringify(orderData, null, 2))

    const { data: order, error: insertError } = await supabase.from("orders").insert(orderData).select().single()

    if (insertError) {
      console.error("[v0] Error inserting order:", insertError)
      return NextResponse.json({ error: "Failed to create order", details: insertError.message }, { status: 500 })
    }

    console.log("[v0] Order created successfully:", order.id)

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error in POST /api/pickups:", error)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export const PATCH = async (request: NextRequest) => {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const status = body.status

    console.log("[v0] Updating order status:", id, status)

    const { data: order, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating order:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log("[v0] Order updated successfully")

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("[v0] Unexpected error in PATCH /api/pickups:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
