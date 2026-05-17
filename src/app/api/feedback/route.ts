import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: "ROI Calculator <noreply@adamnowak.online>",
      to: "me@adamnowak.online",
      subject: "ROI Calculator — feedback",
      text: `New feedback from adamnowak.online/tools/roi-calculator\n\n${message.trim()}\n\n---\nSent at: ${new Date().toISOString()}`,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Feedback route error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
