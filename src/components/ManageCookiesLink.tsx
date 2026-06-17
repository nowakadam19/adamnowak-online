"use client"

import { reopenConsentBanner } from "@/lib/consent"

export default function ManageCookiesLink() {
  return (
    <button
      type="button"
      onClick={reopenConsentBanner}
      className="text-sm text-[var(--paper)]/60 underline underline-offset-2 transition hover:text-[var(--paper)] hover:no-underline"
    >
      Manage cookies
    </button>
  )
}
