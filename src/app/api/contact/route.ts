import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, source } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const emailSource = source === "chat" ? "via chatbot" : "via form";
    await resend.emails.send({
      from: "noreply@adamnowak.online",
      to: "me@adamnowak.online",
      replyTo: email,
      subject: `New message from ${name} (${emailSource})`,
      html: `<div style="font-family:sans-serif;max-width:560px;padding:32px;background:#EFEFEB">
        <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#1E4530;margin:0 0 24px">adamnowak.online · new contact ${emailSource}</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(10,10,8,0.1);font-size:12px;color:rgba(10,10,8,0.45);width:80px">Name</td><td style="padding:10px 0;border-bottom:1px solid rgba(10,10,8,0.1);font-size:14px;color:#0A0A08">${name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(10,10,8,0.1);font-size:12px;color:rgba(10,10,8,0.45)">Email</td><td style="padding:10px 0;border-bottom:1px solid rgba(10,10,8,0.1);font-size:14px"><a href="mailto:${email}" style="color:#1E4530">${email}</a></td></tr>
          <tr><td style="padding:16px 0 10px;font-size:12px;color:rgba(10,10,8,0.45);vertical-align:top">Message</td><td style="padding:16px 0 10px;font-size:14px;color:#0A0A08;line-height:1.65">${message}</td></tr>
        </table>
        <p style="margin:32px 0 0;font-size:12px;color:rgba(10,10,8,0.3)">Reply to this email to respond directly to ${name}.</p>
      </div>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
