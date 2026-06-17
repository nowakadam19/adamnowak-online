"use client"

import { reopenConsentBanner } from "@/lib/consent"

export default function ManageCookiesLink() {
  return (
    <button
      type="button"
      onClick={reopenConsentBanner}
      className="transition-colors duration-200"
      style={{
        fontFamily: 'var(--font-syne)',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(245,240,232,0.4)',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.4)')}
    >
      Manage cookies
    </button>
  )
}
