"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";

type Phase = "landing" | "chat" | "form" | "success";
interface Msg { id: number; from: "bot" | "user"; text: string; }
interface ContactData { name: string; email: string; message: string; }

const PARSE_MARKER = "CONTACT_COLLECTED:";

function parseReply(text: string): { clean: string; data: ContactData | null } {
  const i = text.indexOf(PARSE_MARKER);
  if (i !== -1) {
    try {
      return { clean: text.slice(0, i).trim(), data: JSON.parse(text.slice(i + PARSE_MARKER.length).trim()) };
    } catch {}
  }
  return { clean: text, data: null };
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span key={i} className="block w-1.5 h-1.5 rounded-full bg-ink/30"
          style={{ animation: "dot 1.2s ease infinite", animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}

function ChatBubble({ msg }: { msg: Msg }) {
  const isUser = msg.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animation: "msgIn 0.2s ease forwards" }}>
      <div className={`max-w-[76%] px-4 py-2.5 text-[14px] leading-relaxed
        ${isUser
          ? "bg-ink text-paper rounded-[14px_14px_3px_14px]"
          : "bg-white text-ink shadow-sm rounded-[14px_14px_14px_3px]"}`}>
        {msg.text}
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [collected, setCollected] = useState<ContactData | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const history = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
  }, [input]);

  async function callChat(apiMessages: typeof history.current) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages }),
    });
    if (!res.ok) throw new Error("failed");
    return (await res.json()).text as string;
  }

  async function sendEmail(payload: ContactData & { source: string }) {
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  const startChat = useCallback(async () => {
    setPhase("chat"); setBusy(true);
    try {
      const seed = [{ role: "user" as const, content: "Hi" }];
      const { clean } = parseReply(await callChat(seed));
      history.current = [...seed, { role: "assistant", content: clean }];
      setMsgs([{ from: "bot", text: clean, id: 1 }]);
    } catch {
      setMsgs([{ from: "bot", text: "Hi — how can I help you today?", id: 1 }]);
    }
    setBusy(false);
  }, []);

  const sendChatMsg = useCallback(async () => {
    if (!input.trim() || busy) return;
    const txt = input.trim();
    setInput("");
    history.current = [...history.current, { role: "user", content: txt }];
    setMsgs((p) => [...p, { from: "user", text: txt, id: Date.now() }]);
    setBusy(true);
    try {
      const text = await callChat(history.current);
      const { clean, data } = parseReply(text);
      history.current = [...history.current, { role: "assistant", content: clean }];
      setMsgs((p) => [...p, { from: "bot", text: clean, id: Date.now() + 1 }]);
      if (data) {
        sendEmail({ ...data, source: "chat" }).catch(console.error);
        setTimeout(() => { setCollected(data); setPhase("success"); }, 800);
      }
    } catch {
      setMsgs((p) => [...p, { from: "bot", text: "Something went wrong — please try again.", id: Date.now() }]);
    }
    setBusy(false);
  }, [input, busy]);

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMsg || formBusy) return;
    setFormBusy(true);
    try {
      await sendEmail({ name: formName, email: formEmail, message: formMsg, source: "form" });
      setCollected({ name: formName, email: formEmail, message: formMsg });
      setPhase("success");
    } catch {}
    setFormBusy(false);
  };

  if (phase === "landing") return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-16 text-center" style={{ paddingTop: "calc(72px + 60px)" }}>
      <div className="max-w-xl mx-auto flex flex-col items-center w-full">
      <p className="text-[10px] tracking-[0.22em] uppercase text-green mb-7">Customer Loyalty Intelligence</p>
      <h1 className="font-serif italic text-[clamp(52px,11vw,72px)] leading-none text-ink mb-5">
        Let&apos;s <span className="text-green">talk.</span>
      </h1>
      <p className="text-sm text-ink/45 max-w-[300px] leading-[1.8] mb-10">
        Strategy, speaking, partnerships — or something else.<br />I respond personally.
      </p>
      <button onClick={startChat}
        className="text-[11px] tracking-[0.18em] uppercase bg-ink text-paper px-10 py-3.5 hover:bg-green transition-colors duration-200">
        Start the conversation
      </button>
      <button onClick={() => setPhase("form")}
        className="mt-5 text-[11px] tracking-[0.12em] uppercase text-ink/35 hover:text-ink transition-colors">
        prefer a form →
      </button>
      </div>
    </main>
  );

  if (phase === "success") return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-16 text-center" style={{ paddingTop: "calc(72px + 60px)" }}>
      <div className="w-12 h-12 rounded-full bg-green flex items-center justify-center mb-7">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 11.5L9 16.5L18 7" stroke="#EFEFEB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="font-serif italic text-[clamp(38px,8vw,54px)] leading-tight text-ink mb-4">
        Got it{collected?.name ? `, ${collected.name}` : ""}.
      </h2>
      <p className="text-sm text-ink/45 leading-relaxed">
        I&apos;ll get back to you at <strong className="text-ink font-medium">{collected?.email}</strong>.
      </p>
    </main>
  );

  if (phase === "form") return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-16" style={{ paddingTop: "calc(72px + 60px)" }}>
      <div className="w-full max-w-md">
        <button onClick={() => setPhase("landing")}
          className="text-[11px] tracking-[0.12em] uppercase text-ink/35 hover:text-ink transition-colors mb-10">
          ← Back
        </button>
        <h2 className="font-serif italic text-[clamp(36px,8vw,50px)] leading-tight text-ink mb-8">
          Send a <span className="text-green">message.</span>
        </h2>
        <form onSubmit={submitForm} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] tracking-[0.15em] uppercase text-ink/40">First name</label>
            <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)}
              placeholder="Your name"
              className="bg-white border border-ink/10 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-green transition-colors"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] tracking-[0.15em] uppercase text-ink/40">Email</label>
            <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-white border border-ink/10 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-green transition-colors"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] tracking-[0.15em] uppercase text-ink/40">Message</label>
            <textarea required value={formMsg} onChange={(e) => setFormMsg(e.target.value)}
              placeholder="What would you like to discuss?" rows={3}
              className="bg-white border border-ink/10 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-green transition-colors resize-none leading-relaxed"
              style={{ minHeight: "96px" }}
              onInput={(e) => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }}/>
          </div>
          <button type="submit" disabled={formBusy}
            className="text-[11px] tracking-[0.18em] uppercase bg-ink text-paper py-3.5 hover:bg-green transition-colors duration-200 disabled:opacity-50">
            {formBusy ? "Sending…" : "Send message"}
          </button>
        </form>
        <button onClick={startChat}
          className="mt-6 text-[11px] tracking-[0.12em] uppercase text-ink/35 hover:text-ink transition-colors">
          prefer the chatbot →
        </button>
      </div>
    </main>
  );

  const canSend = input.trim().length > 0 && !busy;
  return (
    <main className="bg-paper flex justify-center" style={{ paddingTop: "60px", minHeight: "100dvh" }}>
      <div className="flex flex-col w-full max-w-lg" style={{ height: "calc(100dvh - 60px)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-ink/10 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
            <span className="font-serif italic text-[12px] text-paper">EV</span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-ink leading-none mb-0.5">Eva</p>
            <p className="text-[10px] tracking-[0.1em] uppercase" style={{ color: "#4CAF7D" }}>● Adam&apos;s Assistant</p>
          </div>
          <button onClick={() => setPhase("form")}
            className="ml-auto text-[10px] tracking-[0.12em] uppercase text-ink/30 hover:text-ink/60 transition-colors">
            use form →
          </button>
          <button onClick={() => setPhase("landing")}
            className="text-[10px] tracking-[0.12em] uppercase text-ink/20 hover:text-ink/50 transition-colors ml-3">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col justify-end gap-3.5">
          {msgs.map((m) => <ChatBubble key={m.id} msg={m} />)}
          {busy && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm rounded-[14px_14px_14px_3px]"><TypingDots /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-end gap-2.5 px-3.5 py-3 border-t border-ink/10 flex-shrink-0">
          <textarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMsg(); }}}
            placeholder="Type your message…" rows={1}
            className="flex-1 bg-white border border-ink/10 rounded-[10px] px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink/30 resize-none leading-[1.5] focus:outline-none focus:border-green transition-colors"
            style={{ maxHeight: 110, overflowY: "auto" }}/>
          <button onClick={sendChatMsg} disabled={!canSend}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150"
            style={{ background: canSend ? "#0A0A08" : "rgba(10,10,8,0.12)" }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M1 13L13 7L1 1V5.5L9 7L1 8.5V13Z" fill={canSend ? "#EFEFEB" : "rgba(10,10,8,0.25)"}/>
            </svg>
          </button>
        </div>

      </div>
    </main>
  );
}
