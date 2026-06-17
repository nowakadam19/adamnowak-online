// Consent Mode v2 helper. Defaults all user-controlled categories to "denied".
// User choice is persisted in localStorage and re-applied to gtag on every page load.

export type ConsentState = "granted" | "denied"

export interface ConsentChoice {
  ad_storage: ConsentState
  ad_user_data: ConsentState
  ad_personalization: ConsentState
  analytics_storage: ConsentState
}

const CONSENT_STORAGE_KEY = "adamnowak-consent-v1"

export const ACCEPT_ALL_CONSENT: ConsentChoice = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
}

export const REJECT_ALL_CONSENT: ConsentChoice = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsentChoice
  } catch {
    return null
  }
}

export function storeConsent(choice: ConsentChoice): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice))
}

export function applyConsent(choice: ConsentChoice): void {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return
  window.gtag("consent", "update", choice)
}

export const REOPEN_CONSENT_EVENT = "adamnowak:reopen-consent"

export function reopenConsentBanner(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(REOPEN_CONSENT_EVENT))
}
