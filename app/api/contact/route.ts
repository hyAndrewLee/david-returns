import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const POST = async (request: Request) => {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: "David Returns <hello@davidreturns.com>",
      to: "hello@davidreturns.com",
      replyTo: email,
      subject: `[Support] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Support Request</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">This message was sent via the David Returns support form.</p>
        </div>
      `,
    })

    if (error) {
      console.error("[v0] Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    console.log("[v0] Support email sent successfully:", data?.id)

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      emailId: data?.id,
    })
  } catch (error) {
    console.error("[v0] Error processing contact form:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
