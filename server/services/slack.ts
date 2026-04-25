import "server-only"

import type { Order } from "@/server/db/schema/orders"
import type { Profile } from "@/server/db/schema/profiles"
import { createLogger } from "@/lib/logger"

const log = createLogger("slack")

const MAX_ITEMS_IN_MESSAGE = 10
const MAX_DESC_CHARS = 60

type SendSlackOrderNotificationProps = {
  order: Order
  profile: Profile | null
  customerEmail: string | null
  isMembership: boolean
  discountApplied?: string
}

type SlackBlock = Record<string, unknown>

const truncate = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text

const formatPickupMethod = (method: string | null): string => {
  switch (method) {
    case "hand-to-me":
    case "hand":
      return "Hand to us"
    case "leave-at-door":
      return "Leave at door"
    case "doorman":
      return "Leave with doorman"
    default:
      return method ?? "Not specified"
  }
}

const formatPickupDate = (date: string): string => {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const buildBlocks = ({
  order,
  profile,
  customerEmail,
  isMembership,
  discountApplied,
}: SendSlackOrderNotificationProps): { blocks: SlackBlock[]; fallback: string } => {
  const addr = order.address
  const items = Array.isArray(order.items) ? order.items : []
  const itemCount = items.length
  const customerName = profile?.fullName || addr.fullName || "Customer"
  const customerPhone = profile?.phone || addr.phone || null
  const totalFormatted = `$${(order.totalAmount / 100).toFixed(2)}`
  const orderShort = order.id.slice(0, 8).toUpperCase()
  const dateFormatted = formatPickupDate(String(order.pickupDate))
  const addressLine =
    [addr.street, addr.apt, addr.city, addr.zip].filter((part) => Boolean(part)).join(", ") || "_(no address)_"
  const pickupMethodText = formatPickupMethod(order.pickupMethod)
  const adminUrl = `${process.env.NEXT_PUBLIC_URL || "https://www.davidreturns.com"}/manage/orders/${order.id}`

  const badges: string[] = []
  if (order.isInstant === true) badges.push("`INSTANT`")
  if (isMembership) badges.push("`MEMBERSHIP`")
  if (discountApplied) badges.push(`\`${discountApplied}\``)

  const itemLines = items.slice(0, MAX_ITEMS_IN_MESSAGE).map((it) => {
    const label = it.retailer || "Item"
    const desc = it.description ? ` — ${truncate(it.description, MAX_DESC_CHARS)}` : ""
    return `• ${label}${desc}`
  })
  const overflow = items.length > MAX_ITEMS_IN_MESSAGE ? `\n…and ${items.length - MAX_ITEMS_IN_MESSAGE} more` : ""
  const itemsText = itemLines.length > 0 ? `${itemLines.join("\n")}${overflow}` : "_(no items)_"

  const fallback = `New Order #${orderShort} — ${customerName} — ${itemCount} ${itemCount === 1 ? "item" : "items"} — ${totalFormatted}`

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `:package: New Order #${orderShort}`, emoji: true },
    },
  ]

  if (badges.length > 0) {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: badges.join(" ") }],
    })
  }

  blocks.push(
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer*\n${customerName}` },
        { type: "mrkdwn", text: `*Email*\n${customerEmail || "_(no email)_"}` },
        { type: "mrkdwn", text: `*Phone*\n${customerPhone || "_(no phone)_"}` },
        { type: "mrkdwn", text: `*Total*\n${totalFormatted}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Pickup Date*\n${dateFormatted}` },
        { type: "mrkdwn", text: `*Time*\n${order.pickupTime}` },
        { type: "mrkdwn", text: `*Method*\n${pickupMethodText}` },
        { type: "mrkdwn", text: `*Address*\n${addressLine}` },
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*Items (${itemCount}):*\n${itemsText}` },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View in Admin", emoji: true },
          url: adminUrl,
          style: "primary",
        },
      ],
    },
    { type: "divider" },
  )

  return { blocks, fallback }
}

export const sendSlackOrderNotification = async (props: SendSlackOrderNotificationProps): Promise<void> => {
  const webhookUrl = process.env.SLACK_ORDER_WEBHOOK_URL
  if (!webhookUrl) return

  const { blocks, fallback } = buildBlocks(props)

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: fallback, blocks }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      log.error(
        { status: res.status, body, orderId: props.order.id },
        "slack webhook returned non-2xx",
      )
    }
  } catch (error) {
    log.error({ error, orderId: props.order.id }, "slack webhook request failed")
  }
}
