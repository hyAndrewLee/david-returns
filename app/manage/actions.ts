"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { uploadToStorage } from "@/lib/supabase/storage"
import { cookies } from "next/headers"

const verifyAdminAccess = async () => {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")

  if (!adminSession || adminSession.value !== "authenticated") {
    throw new Error("Unauthorized - Admin access required")
  }
}

export const updateOrderStatus = async (
  orderId: string,
  data: {
    tracking_status: string
    admin_notes?: string
    tracking_number?: string
  },
) => {
  await verifyAdminAccess()

  const adminClient = createAdminClient()

  const updateData: Record<string, unknown> = {
    tracking_status: data.tracking_status,
    admin_notes: data.admin_notes,
    tracking_number: data.tracking_number,
    updated_at: new Date().toISOString(),
  }

  // Set timestamps based on status
  if (data.tracking_status === "picked_up") {
    updateData.picked_up_at = new Date().toISOString()
  } else if (data.tracking_status === "delivered") {
    updateData.delivered_at = new Date().toISOString()
  } else if (data.tracking_status === "return_confirmed") {
    updateData.return_confirmed_at = new Date().toISOString()
  }

  const { error } = await adminClient.from("orders").update(updateData).eq("id", orderId)

  if (error) {
    throw new Error(`Failed to update order: ${error.message}`)
  }

  revalidatePath(`/manage/orders/${orderId}`)
  revalidatePath("/manage/dashboard")
}

export const uploadProofImage = async (formData: FormData) => {
  await verifyAdminAccess()

  const file = formData.get("file") as File
  const orderId = formData.get("orderId") as string
  const type = formData.get("type") as "pickup" | "delivery" | "return"

  if (!file || !orderId || !type) {
    const missingFields = []
    if (!file) missingFields.push("file")
    if (!orderId) missingFields.push("orderId")
    if (!type) missingFields.push("type")
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
  }

  try {
    const result = await uploadToStorage(file, `${type}-${Date.now()}.jpg`, file.type, `proofs/${orderId}`)

    if (result.error || !result.url) {
      throw new Error(result.error || "Upload failed")
    }

    const adminClient = createAdminClient()
    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString(),
    }

    if (type === "pickup") {
      updateData.proof_pickup_url = result.url
    } else if (type === "delivery") {
      updateData.proof_delivery_url = result.url
    } else if (type === "return") {
      updateData.proof_return_url = result.url
    }

    const { error } = await adminClient.from("orders").update(updateData).eq("id", orderId).select()

    if (error) {
      throw new Error(`Failed to update proof: ${error.message}`)
    }

    revalidatePath(`/manage/orders/${orderId}`)

    return { url: result.url }
  } catch (error) {
    console.error("Upload failed:", error)
    throw error
  }
}

export const deleteOrder = async (orderId: string) => {
  await verifyAdminAccess()

  const adminClient = createAdminClient()

  const { error } = await adminClient.from("orders").delete().eq("id", orderId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/manage/dashboard")
  return { success: true }
}

export const bulkDeleteOrders = async (orderIds: string[]) => {
  await verifyAdminAccess()

  const adminClient = createAdminClient()

  const { error } = await adminClient.from("orders").delete().in("id", orderIds)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/manage/dashboard")
  return { success: true }
}
