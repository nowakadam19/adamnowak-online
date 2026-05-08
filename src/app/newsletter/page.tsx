import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Coming soon.',
}

export default function NewsletterPage() {
  return (
    <div
      className="mx-auto max-w-[760px] px-6 md:px-12"
      style={{ paddingTop: 'calc(72px + 60px)', paddingBottom: '72px' }}
    >
      <h1
        className="mb-6"
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(38px, 4vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        Newsletter
      </h1>
      <p style={{ fontSize: '17px', color: 'var(--muted)' }}>Coming soon.</p>
    </div>
  )
}
