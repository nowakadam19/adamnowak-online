import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { CHAT_MODES, isChatMode } from "@/lib/bot-prompts";
import { chatLimiter, clientKey, limitMessage } from "@/lib/chat-rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RETRY_DELAYS = [1000, 2000, 4000];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // No mode (the /contact page) = Eva, exactly as before modes existed
    const mode = body.mode ?? "eva";
    if (!isChatMode(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }
    const prepared = CHAT_MODES[mode].prepare(body);
    if ("error" in prepared) {
      return NextResponse.json({ error: prepared.error }, { status: 400 });
    }
    // One daily budget per IP across all modes; counted only for requests that reach the model
    if (!chatLimiter.take(clientKey(req.headers))) {
      return NextResponse.json(
        { error: "rate_limited", message: limitMessage(req.headers.get("accept-language")) },
        { status: 429 },
      );
    }

    let lastErr: unknown;
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      try {
        const response = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: CHAT_MODES[mode].maxTokens,
          system: prepared.system,
          messages: prepared.messages,
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
