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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ink)]/15 bg-[var(--paper)] shadow-lg"
    >
      <div className="mx-auto max-w-4xl px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2
              id="cookie-consent-title"
              className="mb-1 font-semibold text-[var(--ink)]"
            >
              Cookies
            </h2>
            <p
              id="cookie-consent-description"
              className="text-sm text-[var(--ink)]/80"
            >
              This site uses cookies to analyze traffic and improve your
              experience. Essential cookies are always active. Analytics and
              marketing cookies require your consent.{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-2 hover:no-underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              onClick={handleReject}
              className="rounded border border-[var(--ink)]/30 px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--ink)]/5"
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="rounded border border-[var(--ink)]/30 px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--ink)]/5"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
