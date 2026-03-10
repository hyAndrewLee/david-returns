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

export async function sendOrderConfirmation({
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
}: OrderConfirmationProps) {
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
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background-color: #000000; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Return Confirmed!</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                      Hi ${customerName},
                    </p>
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.5;">
                      Your return pickup has been scheduled! We'll pick up your ${itemCount} ${itemCount === 1 ? "item" : "items"} and handle the drop-off for you.
                    </p>
                    
                    <!-- Order Details Box -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9f9f9; border-radius: 6px; margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h2 style="margin: 0 0 15px; color: #000000; font-size: 18px; font-weight: 600;">Pickup Details</h2>
                          
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Order Number:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">#${orderId.slice(0, 8).toUpperCase()}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Pickup Date:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${formattedDate}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Time Window:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${pickupTime}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Pickup Method:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${pickupMethodText}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Address:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${addressLine}</td>
                            </tr>
                            <tr>
                              <td style="padding: 16px 0 0; color: #666666; font-size: 14px; border-top: 1px solid #e0e0e0;">Total:</td>
                              <td style="padding: 16px 0 0; color: #000000; font-size: 18px; font-weight: 600; text-align: right; border-top: 1px solid #e0e0e0;">$${formattedTotal}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                      <tr>
                        <td align="center">
                          <a href="${trackingUrl}" style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">Track Your Order</a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 10px; color: #333333; font-size: 16px; line-height: 1.5;">
                      <strong>What's Next?</strong>
                    </p>
                    <ul style="margin: 0 0 20px; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.6;">
                      <li style="margin-bottom: 8px;">Have your ${itemCount} ${itemCount === 1 ? "package" : "packages"} ready for pickup</li>
                      <li style="margin-bottom: 8px;">We'll ${pickupMethod === "hand" ? "knock or ring when we arrive" : "grab your packages from your door"}</li>
                      <li style="margin-bottom: 8px;">Track your order status in real-time on our website</li>
                      <li>All pickups are photo-verified for your peace of mind</li>
                    </ul>
                    
                    <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                      Questions? Just reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_URL || "https://davidreturns.com"}" style="color: #000000; text-decoration: underline;">website</a>.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} David Returns. All rights reserved.<br/>
                      Making returns easy, one pickup at a time.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: "David Returns <hello@davidreturns.com>",
      to: customerEmail,
      subject: `Return Confirmed! Pickup scheduled for ${formattedDate}`,
      html,
    })

    if (error) {
      console.error("[v0] Resend error:", error)
      throw error
    }

    console.log("[v0] Email sent successfully:", data)
    return data
  } catch (error) {
    console.error("[v0] Failed to send email:", error)
    throw error
  }
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

export async function sendAdminOrderNotification({
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
}: AdminNotificationProps) {
  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail) {
    console.log("[v0] ADMIN_EMAIL not configured, skipping admin notification")
    return
  }

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
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Return Order</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background-color: #ff5c00; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔔 New Return Order</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5; font-weight: 600;">
                      A customer has submitted a new return order!
                    </p>
                    <p style="margin: 0 0 30px; color: #666666; font-size: 14px; line-height: 1.5;">
                      Check the admin dashboard for full details and manage this pickup.
                    </p>
                    
                    <!-- Customer Details -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9f9f9; border-radius: 6px; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h2 style="margin: 0 0 15px; color: #000000; font-size: 18px; font-weight: 600;">Customer Information</h2>
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Name:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${customerName}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Email:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right;">${customerEmail}</td>
                            </tr>
                            ${
                              customerPhone
                                ? `
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Phone:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right;">${customerPhone}</td>
                            </tr>
                            `
                                : ""
                            }
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Pickup Details -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff4e6; border-radius: 6px; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h2 style="margin: 0 0 15px; color: #000000; font-size: 18px; font-weight: 600;">Pickup Details</h2>
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Order #:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">#${orderId.slice(0, 8).toUpperCase()}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Date:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${formattedDate}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Time:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${pickupTime}${isInstant ? ' <span style="color: #ff5c00; font-weight: 600;">(INSTANT)</span>' : ""}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Method:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${pickupMethodText}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px; vertical-align: top;">Address:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${addressLine}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #666666; font-size: 14px;">Items:</td>
                              <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500; text-align: right;">${itemCount} ${itemCount === 1 ? "item" : "items"}</td>
                            </tr>
                            <tr>
                              <td style="padding: 16px 0 0; color: #666666; font-size: 14px; border-top: 1px solid #ffd699;">Total Paid:</td>
                              <td style="padding: 16px 0 0; color: #000000; font-size: 18px; font-weight: 600; text-align: right; border-top: 1px solid #ffd699;">$${formattedTotal}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                      <tr>
                        <td align="center">
                          <a href="${adminOrderUrl}" style="display: inline-block; padding: 14px 32px; background-color: #ff5c00; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">View Order in Admin Dashboard</a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0 0; color: #666666; font-size: 13px; line-height: 1.5; text-align: center;">
                      This is an automated notification from David Returns.<br/>
                      Order ID: ${orderId}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} David Returns Admin Portal
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: "David Returns <hello@davidreturns.com>",
      to: adminEmail,
      subject: `🔔 New Order #${orderId.slice(0, 8)} - ${customerName} - ${itemCount} ${itemCount === 1 ? "item" : "items"}`,
      html,
    })

    if (error) {
      console.error("[v0] Failed to send admin notification:", error)
      throw error
    }

    console.log("[v0] Admin notification sent successfully:", data)
    return data
  } catch (error) {
    console.error("[v0] Error sending admin notification:", error)
    throw error
  }
}
