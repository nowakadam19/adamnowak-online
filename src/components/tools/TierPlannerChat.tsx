"use client"

// "Ask about your tiers": the Tier Planner bot. Nothing is sent to the model until the visitor
// presses Start. Every request carries the summary of the tool's current result, never customer rows.
import { useEffect, useRef, useState } from "react"
import type { TierBotContext } from "@/lib/tier-bot-context"

interface Msg { id: number; from: "bot" | "user"; text: string; error?: boolean }
type Turn = { role: "user" | "assistant"; content: string }

const LIMIT_FALLBACK = "You've reached today's limit for this assistant. Try again tomorrow."
const ERROR_TEXT = "Something went wrong. Please try again."

type Reply = { ok: true; text: string } | { ok: false; limit: string | null }

async function askBot(messages: Turn[], context: TierBotContext): Promise<Reply> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "tier-planner", messages, context }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 429) return { ok: false, limit: typeof data.message === "string" ? data.message : LIMIT_FALLBACK }
    if (!res.ok || typeof data.text !== "string" || !data.text.trim()) return { ok: false, limit: null }
    return { ok: true, text: data.text.trim() }
  } catch {
    return { ok: false, limit: null }
  }
}

function TypingDots() {
  return (
    <span className="flex gap-1 items-center px-4 py-3" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="block w-1.5 h-1.5 rounded-full"
          style={{ background: "rgba(10,10,8,0.3)", animation: "dot 1.2s ease infinite", animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  )
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.from === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`} style={{ animation: "msgIn 0.2s ease forwards" }}>
      <div className={`max-w-[88%] px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-line
        ${isUser ? "rounded-[14px_14px_3px_14px]" : "rounded-[14px_14px_14px_3px]"}`}
        style={isUser
          ? { background: "var(--ink)", color: "#FAFAF8" }
          : { background: "var(--paper)", color: msg.error ? "#7a5520" : "var(--ink)" }}>
        {msg.text}
      </div>
    </div>
  )
}

export function TierPlannerChat({ context }: { context: TierBotContext }) {
  const [started, setStarted] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [limit, setLimit] = useState<string | null>(null)
  const history = useRef<Turn[]>([])
  // Always the latest summary, so each reply comments on the sliders as they are now
  const contextRef = useRef(context)
  const listRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  useEffect(() => { contextRef.current = context }, [context])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, busy, limit])

  const push = (msg: Omit<Msg, "id">) => setMsgs((prev) => [...prev, { ...msg, id: nextId.current++ }])

  const start = async () => {
    if (started) return
    setStarted(true)
    setBusy(true)
    const reply = await askBot([], contextRef.current)
    if (reply.ok) {
      history.current = [{ role: "assistant", content: reply.text }]
      push({ from: "bot", text: reply.text })
    } else if (reply.limit) {
      setLimit(reply.limit)
    } else {
      push({ from: "bot", text: ERROR_TEXT, error: true })
    }
    setBusy(false)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || busy || limit) return
    // Opening comment failed: nothing to reply to yet, so try the opening again
    if (history.current.length === 0) {
      setMsgs([])
      setStarted(false)
      return start()
    }
    setInput("")
    push({ from: "user", text })
    const turns: Turn[] = [...history.current, { role: "user", content: text }]
    setBusy(true)
    const reply = await askBot(turns, contextRef.current)
    if (reply.ok) {
      history.current = [...turns, { role: "assistant", content: reply.text }]
      push({ from: "bot", text: reply.text })
    } else if (reply.limit) {
      setLimit(reply.limit)
      setInput(text)
    } else {
      // Keep the history as it was, so the visitor can send the same question again
      push({ from: "bot", text: ERROR_TEXT, error: true })
      setInput(text)
    }
    setBusy(false)
  }

  const canSend = input.trim().length > 0 && !busy && !limit

  return (
    <section aria-labelledby="tier-bot-title" className="rounded-lg border mb-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <h2 id="tier-bot-title" className="px-4 py-2.5 border-b text-[10px] tracking-[0.12em] uppercase font-normal"
        style={{ color: "var(--muted)", borderColor: "var(--border)", fontFamily: "Syne, sans-serif" }}>Ask about your tiers</h2>

      {!started ? (
        <div className="p-4 text-[13px] leading-relaxed">
          <p className="mb-1.5">An assistant comments on the result above using Adam&apos;s rules for tier design, and asks the questions the data cannot answer.</p>
          <p className="mb-3" style={{ color: "var(--muted)" }}>It sees only the summary figures shown here, never your customer data. Up to 15 messages a day.</p>
          <button type="button" onClick={start}
            className="min-h-[44px] w-full sm:w-auto text-[11px] tracking-[0.08em] uppercase px-5 py-2 rounded border transition-colors"
            style={{ fontFamily: "Syne, sans-serif", background: "var(--green)", color: "#fff", borderColor: "var(--green)" }}>Start</button>
        </div>
      ) : (
        <div>
          <div ref={listRef} role="log" aria-live="polite" className="px-3 py-4 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: 440 }}>
            {msgs.map((m) => <Bubble key={m.id} msg={m} />)}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-[14px_14px_14px_3px]" style={{ background: "var(--paper)" }}><TypingDots /></div>
              </div>
            )}
            {limit && (
              <p role="status" className="rounded-md px-3 py-2.5 text-[13px] leading-snug"
                style={{ background: "rgba(192,138,62,0.14)", color: "#7a5520" }}>{limit}</p>
            )}
          </div>
          <div className="flex items-end gap-2 px-3 py-3 border-t" style={{ borderColor: "var(--border)" }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} maxLength={1_500}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
              disabled={!!limit} aria-label="Your question about the tiers"
              placeholder={limit ? "Limit reached for today" : "Ask about thresholds, benefits, reachability…"}
              className="flex-1 min-w-0 min-h-[44px] bg-white border rounded-[10px] px-3 py-2 text-[16px] leading-snug resize-none focus:outline-none disabled:opacity-50"
              style={{ borderColor: "var(--border)", color: "var(--ink)", fontFamily: "Inter, sans-serif" }} />
            <button type="button" onClick={send} disabled={!canSend} aria-label="Send"
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: canSend ? "var(--ink)" : "rgba(10,10,8,0.12)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 13L13 7L1 1V5.5L9 7L1 8.5V13Z" fill={canSend ? "#FAFAF8" : "rgba(10,10,8,0.25)"} />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
