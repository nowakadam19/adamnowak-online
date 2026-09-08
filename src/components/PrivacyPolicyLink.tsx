import Link from "next/link"

export default function PrivacyPolicyLink() {
  return (
    <Link
      href="/privacy-policy"
      className="transition-colors duration-200"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: '44px',
        fontFamily: 'var(--font-syne)',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(245,240,232,0.4)',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.4)')}
    >
      Privacy Policy
    </Link>
  )
}
