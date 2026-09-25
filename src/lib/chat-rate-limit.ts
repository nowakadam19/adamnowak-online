// Daily message limit for /api/chat, shared by every chat mode (one API bill, one budget).
// In process memory only: it resets on every redeploy and is per server instance.
// Deliberately simple for now; a shared store (e.g. Vercel KV) can replace it later.

export const DAILY_MESSAGE_LIMIT = 15

/** Bucket for requests without an IP header: they share one counter as a last line of defence. */
export const UNKNOWN_CLIENT = "unknown"

export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || headers.get("x-real-ip")?.trim() || UNKNOWN_CLIENT
}

export function createDailyLimiter(limit = DAILY_MESSAGE_LIMIT) {
  let day = ""
  const counts = new Map<string, number>()
  return {
    /** Counts one message for `key`; false when today's limit is already used. Days are UTC. */
    take(key: string, now = new Date()): boolean {
      const today = now.toISOString().slice(0, 10)
      if (today !== day) {
        day = today
        counts.clear()
      }
      const used = counts.get(key) ?? 0
      if (used >= limit) return false
      counts.set(key, used + 1)
      return true
    },
  }
}

export const chatLimiter = createDailyLimiter()

const LIMIT_MESSAGES: Record<string, string> = {
  en: "You've reached today's limit for this assistant. Try again tomorrow.",
  pl: "Na dziś wyczerpano limit wiadomości do tego asystenta. Spróbuj ponownie jutro.",
}

/** Limit message in the visitor's browser language when we have it, English otherwise. */
export function limitMessage(acceptLanguage: string | null): string {
  const lang = acceptLanguage?.split(",")[0]?.trim().slice(0, 2).toLowerCase() ?? ""
  return LIMIT_MESSAGES[lang] ?? LIMIT_MESSAGES.en
}
