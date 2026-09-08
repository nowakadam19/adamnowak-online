"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ACCEPT_ALL_CONSENT,
  REJECT_ALL_CONSENT,
  REOPEN_CONSENT_EVENT,
  applyConsent,
  getStoredConsent,
  storeConsent,
} from "@/lib/consent"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [animatedIn, setAnimatedIn] = useState(false)

  useEffect(() => {
    const stored = getStoredConsent()
    if (stored) {
      applyConsent(stored)
      setVisible(false)
    } else {
      setVisible(true)
    }

    const handler = () => setVisible(true)
    window.addEventListener(REOPEN_CONSENT_EVENT, handler)
    return () => window.removeEventListener(REOPEN_CONSENT_EVENT, handler)
  }, [])

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setAnimatedIn(true), 50)
      return () => clearTimeout(t)
    }
    setAnimatedIn(false)
  }, [visible])

  function handleAccept() {
    applyConsent(ACCEPT_ALL_CONSENT)
    storeConsent(ACCEPT_ALL_CONSENT)
    setVisible(false)
  }

  function handleReject() {
    applyConsent(REJECT_ALL_CONSENT)
    storeConsent(REJECT_ALL_CONSENT)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className={`fixed bottom-4 right-4 z-50 w-[300px] max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--ink)]/15 bg-[var(--paper)] p-4 shadow-lg transition-all duration-300 ease-out ${
        animatedIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <h2
        id="cookie-consent-title"
        className="font-serif italic mb-1 text-[17px] leading-tight text-[var(--ink)]"
      >
        Cookies
      </h2>
      <p
        id="cookie-consent-description"
        className="mb-3 text-xs leading-relaxed text-[var(--ink)]/75"
      >
        We use cookies to improve your experience.{" "}
        <Link
          href="/privacy-policy"
          className="inline-flex items-center min-h-[44px] align-middle underline underline-offset-2 hover:no-underline"
        >
          Privacy Policy
        </Link>
      </p>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleReject}
          className="font-display flex flex-1 items-center justify-center min-h-[44px] rounded-md border border-[var(--ink)]/30 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--ink)]/5"
        >
          Reject all
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="font-display flex flex-1 items-center justify-center min-h-[44px] rounded-md border border-[var(--ink)]/30 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--ink)]/5"
        >
          Accept all
        </button>
      </div>
    </div>
  )
}
