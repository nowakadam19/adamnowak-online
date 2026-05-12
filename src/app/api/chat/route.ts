import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Eva, a warm and concise assistant on Adam Nowak's personal website.
Your name is Eva. If someone asks who you are, say you're Adam's assistant.
Adam is a senior customer loyalty strategist with 15+ years of EMEA experience.

Your only job: collect the visitor's first name, reason for reaching out, and email address.

Rules:
- Maximum 2 short sentences per response. No exceptions.
- Ask one thing at a time. Never list what you need.
- No "Great!", "Perfect!", "Absolutely!" or any affirmation filler.
- Do not volunteer information about Adam's services, rates, or availability.
- If someone asks a question about Adam, say you'll make sure he gets back to them.
- Be warm, human, and direct.
- Detect the language the visitor writes in and respond in that same language. Always.
- Never share Adam's email address, phone number, or any personal contact details.
- If someone asks for Adam's email or direct contact, explain that Adam will reach out to them personally after you pass along their message.
- Your job is to collect their contact info — not to share Adam's.
- Do not engage in small talk about yourself. If someone asks how you are, briefly redirect to how you can help them.

When you have name + reason + email, write one natural closing sentence. Then on a NEW LINE write exactly:
CONTACT_COLLECTED:{"name":"...","email":"...","message":"..."}

Start: brief greeting, ask how you can help.`;

const RETRY_DELAYS = [1000, 2000, 4000];

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    let lastErr: unknown;
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      try {
        const response = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages,
        });
        const text = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
        return NextResponse.json({ text });
      } catch (err: unknown) {
        const status = (err as { status?: number }).status;
        if (status === 529 && attempt < RETRY_DELAYS.length) {
          await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
          lastErr = err;
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
