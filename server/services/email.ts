import "server-only"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type OrderConfirmationProps = {
  customerEmail: string
  customerName: string
  orderId: string
  pickupDate: string
  pickupTime: string
  pickupMethod: string
  address: {
    street: string
    apt?: string
    city: string
    zip: string
  }
  itemCount: number
  total: number
  isInstant: boolean
}

export const sendOrderConfirmation = async ({
  customerEmail,
  customerName,
  orderId,
  pickupDate,
  pickupTime,
  pickupMethod,
  address,
  itemCount,
  total,
  isInstant,
}: OrderConfirmationProps) => {
  const pickupMethodText = pickupMethod === "hand" ? "Hand it to us" : "Leave at my door"
  const formattedDate = new Date(pickupDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedTotal = (total / 100).toFixed(2)
  const trackingUrl = `${process.env.NEXT_PUBLIC_URL || "https://davidreturns.com"}/orders/${orderId}`
  const addressLine = `${address.street}${address.apt ? `, ${address.apt}` : ""}, ${address.city}, ${address.zip}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr><td align="center" style="padding:40px 0;">
            <table role="presentation" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <tr><td style="padding:40px 40px 20px;text-align:center;background-color:#000000;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">Return Confirmed!</h1>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.5;">Hi ${customerName},</p>
                <p style="margin:0 0 30px;color:#333;font-size:16px;line-height:1.5;">Your return pickup has been scheduled! We'll pick up your ${itemCount} ${itemCount === 1 ? "item" : "items"} and handle the drop-off for you.</p>
                <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f9f9f9;border-radius:6px;margin-bottom:30px;">
                  <tr><td style="padding:20px;">
                    <h2 style="margin:0 0 15px;color:#000;font-size:18px;font-weight:600;">Pickup Details</h2>
                    <table role="presentation" style="width:100%;border-collapse:collapse;">
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Order Number:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">#${orderId.slice(0, 8).toUpperCase()}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Pickup Date:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${formattedDate}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Time Window:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${pickupTime}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Pickup Method:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${pickupMethodText}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Address:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${addressLine}</td></tr>
                      <tr><td style="padding:16px 0 0;color:#666;font-size:14px;border-top:1px solid #e0e0e0;">Total:</td><td style="padding:16px 0 0;color:#000;font-size:18px;font-weight:600;text-align:right;border-top:1px solid #e0e0e0;">$${formattedTotal}</td></tr>
                    </table>
                  </td></tr>
                </table>
                <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:30px;">
                  <tr><td align="center"><a href="${trackingUrl}" style="display:inline-block;padding:14px 32px;background-color:#000;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:500;">Track Your Order</a></td></tr>
                </table>
                <p style="margin:20px 0 0;color:#666;font-size:14px;line-height:1.5;">Questions? Just reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_URL || "https://davidreturns.com"}" style="color:#000;text-decoration:underline;">website</a>.</p>
              </td></tr>
              <tr><td style="padding:20px 40px;text-align:center;border-top:1px solid #e0e0e0;">
                <p style="margin:0;color:#999;font-size:12px;">© ${new Date().getFullYear()} David Returns. All rights reserved.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `

  const { data, error } = await resend.emails.send({
    from: "David Returns <hello@davidreturns.com>",
    to: customerEmail,
    subject: `Return Confirmed! Pickup scheduled for ${formattedDate}`,
    html,
  })

  if (error) {
    console.error("Resend error:", error)
    throw error
  }

  return data
}

type AdminNotificationProps = {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  pickupDate: string
  pickupTime: string
  pickupMethod: string
  address: {
    street: string
    apt?: string
    city: string
    zip: string
  }
  itemCount: number
  total: number
  isInstant: boolean
}

export const sendAdminOrderNotification = async ({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  pickupDate,
  pickupTime,
  pickupMethod,
  address,
  itemCount,
  total,
  isInstant,
}: AdminNotificationProps) => {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  const pickupMethodText =
    pickupMethod === "hand-to-me" ? "Hand to us" : pickupMethod === "leave-at-door" ? "Leave at door" : "Leave with doorman"
  const formattedDate = new Date(pickupDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedTotal = (total / 100).toFixed(2)
  const adminOrderUrl = `${process.env.NEXT_PUBLIC_URL || "https://www.davidreturns.com"}/manage/orders/${orderId}`
  const addressLine = `${address.street}${address.apt ? `, ${address.apt}` : ""}, ${address.city}, ${address.zip}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr><td align="center" style="padding:40px 0;">
            <table role="presentation" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <tr><td style="padding:40px 40px 20px;text-align:center;background-color:#ff5c00;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;color:#fff;font-size:28px;font-weight:600;">New Return Order</h1>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.5;font-weight:600;">A customer has submitted a new return order!</p>
                <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f9f9f9;border-radius:6px;margin-bottom:20px;">
                  <tr><td style="padding:20px;">
                    <h2 style="margin:0 0 15px;color:#000;font-size:18px;font-weight:600;">Customer Information</h2>
                    <table role="presentation" style="width:100%;border-collapse:collapse;">
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Name:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${customerName}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Email:</td><td style="padding:8px 0;color:#333;font-size:14px;text-align:right;">${customerEmail}</td></tr>
                      ${customerPhone ? `<tr><td style="padding:8px 0;color:#666;font-size:14px;">Phone:</td><td style="padding:8px 0;color:#333;font-size:14px;text-align:right;">${customerPhone}</td></tr>` : ""}
                    </table>
                  </td></tr>
                </table>
                <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#fff4e6;border-radius:6px;margin-bottom:20px;">
                  <tr><td style="padding:20px;">
                    <h2 style="margin:0 0 15px;color:#000;font-size:18px;font-weight:600;">Pickup Details</h2>
                    <table role="presentation" style="width:100%;border-collapse:collapse;">
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Order #:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:600;text-align:right;">#${orderId.slice(0, 8).toUpperCase()}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Date:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${formattedDate}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Time:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${pickupTime}${isInstant ? ' <span style="color:#ff5c00;font-weight:600;">(INSTANT)</span>' : ""}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Method:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${pickupMethodText}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;vertical-align:top;">Address:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${addressLine}</td></tr>
                      <tr><td style="padding:8px 0;color:#666;font-size:14px;">Items:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:500;text-align:right;">${itemCount} ${itemCount === 1 ? "item" : "items"}</td></tr>
                      <tr><td style="padding:16px 0 0;color:#666;font-size:14px;border-top:1px solid #ffd699;">Total Paid:</td><td style="padding:16px 0 0;color:#000;font-size:18px;font-weight:600;text-align:right;border-top:1px solid #ffd699;">$${formattedTotal}</td></tr>
                    </table>
                  </td></tr>
                </table>
                <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                  <tr><td align="center"><a href="${adminOrderUrl}" style="display:inline-block;padding:14px 32px;background-color:#ff5c00;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:600;">View Order in Admin Dashboard</a></td></tr>
                </table>
              </td></tr>
              <tr><td style="padding:20px 40px;text-align:center;border-top:1px solid #e0e0e0;">
                <p style="margin:0;color:#999;font-size:12px;">© ${new Date().getFullYear()} David Returns Admin Portal</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `

  const { data, error } = await resend.emails.send({
    from: "David Returns <hello@davidreturns.com>",
    to: adminEmail,
    subject: `New Order #${orderId.slice(0, 8)} - ${customerName} - ${itemCount} ${itemCount === 1 ? "item" : "items"}`,
    html,
  })

  if (error) {
    console.error("Failed to send admin notification:", error)
    throw error
  }

  return data
}

type WelcomeEmailProps = {
  customerEmail: string
  customerName: string
}

export const sendWelcomeEmail = async ({ customerEmail, customerName }: WelcomeEmailProps) => {
  const firstName = customerName.trim().split(/\s+/)[0] || customerName || "there"
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://davidreturns.com"
  const scheduleUrl = `${baseUrl}/schedule`
  const dashboardUrl = `${baseUrl}/dashboard`

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr><td align="center" style="padding:40px 0;">
            <table role="presentation" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <tr><td style="padding:40px 40px 20px;text-align:center;background-color:#000000;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">Welcome to David Returns</h1>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.5;">Hi ${firstName},</p>
                <p style="margin:0 0 30px;color:#333;font-size:16px;line-height:1.5;">You're in. Schedule your first pickup and skip the line for good.</p>
                <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f9f9f9;border-radius:6px;margin-bottom:30px;">
                  <tr><td style="padding:20px;">
                    <h2 style="margin:0 0 15px;color:#000;font-size:18px;font-weight:600;">What's next</h2>
                    <table role="presentation" style="width:100%;border-collapse:collapse;">
                      <tr><td style="padding:8px 0;color:#333;font-size:14px;line-height:1.5;">&bull;&nbsp;&nbsp;Pack your returns &mdash; labels or not, we handle it.</td></tr>
                      <tr><td style="padding:8px 0;color:#333;font-size:14px;line-height:1.5;">&bull;&nbsp;&nbsp;Pick a time &mdash; morning, afternoon, or instant.</td></tr>
                      <tr><td style="padding:8px 0;color:#333;font-size:14px;line-height:1.5;">&bull;&nbsp;&nbsp;Hand off or leave at door &mdash; your call.</td></tr>
                    </table>
                  </td></tr>
                </table>
                <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                  <tr><td align="center"><a href="${scheduleUrl}" style="display:inline-block;padding:14px 32px;background-color:#000;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:500;">Schedule a Pickup</a></td></tr>
                </table>
                <p style="margin:20px 0 0;text-align:center;color:#666;font-size:14px;line-height:1.5;">Or visit your <a href="${dashboardUrl}" style="color:#000;text-decoration:underline;">dashboard</a>.</p>
                <p style="margin:30px 0 0;color:#666;font-size:14px;line-height:1.5;">Questions? Just reply to this email.</p>
              </td></tr>
              <tr><td style="padding:20px 40px;text-align:center;border-top:1px solid #e0e0e0;">
                <p style="margin:0;color:#999;font-size:12px;">&copy; ${new Date().getFullYear()} David Returns. All rights reserved.</p>
                <p style="margin:4px 0 0;color:#999;font-size:12px;">hello@davidreturns.com</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `

  const { data, error } = await resend.emails.send({
    from: "David Returns <hello@davidreturns.com>",
    to: customerEmail,
    subject: "Welcome to David Returns — your first pickup awaits",
    html,
  })

  if (error) {
    console.error("Resend welcome error:", error)
    throw error
  }

  return data
}

type ContactFormProps = {
  name: string
  email: string
  subject: string
  message: string
}

export const sendContactForm = async ({ name, email, subject, message }: ContactFormProps) => {
  const { data, error } = await resend.emails.send({
    from: "David Returns <hello@davidreturns.com>",
    to: "hello@davidreturns.com",
    replyTo: email,
    subject: `[Support] ${subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#333;">New Support Request</h2>
        <div style="background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="margin:10px 0;"><strong>From:</strong> ${name}</p>
          <p style="margin:10px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin:10px 0;"><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="margin:20px 0;">
          <p style="margin:10px 0;"><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;line-height:1.6;">${message}</p>
        </div>
      </div>
    `,
  })

  if (error) {
    console.error("Resend error:", error)
    throw error
  }

  return data
}
