import Link from "next/link"

export default function PrivacyPolicyLink() {
  return (
    <Link
      href="/privacy-policy"
      className="text-sm text-[var(--paper)]/60 underline underline-offset-2 transition hover:text-[var(--paper)] hover:no-underline"
    >
      Privacy Policy
    </Link>
  )
}
