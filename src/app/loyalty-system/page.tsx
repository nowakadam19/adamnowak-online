import Link from 'next/link'
import { getAllPillars } from '@/lib/loyalty-system'
import type { Metadata } from 'next'

const SITE_URL = 'https://www.adamnowak.online'

export const metadata: Metadata = {
  title: 'The Loyalty System | Adam Nowak',
  description:
    'The biggest mistake in loyalty is a missing system. Six interdependent pillars for practitioners who want customer loyalty that actually lasts — not a checklist.',
  alternates: {
    canonical: `${SITE_URL}/loyalty-system`,
  },
  openGraph: {
    type: 'website',
    title: 'The Loyalty System | Adam Nowak',
    description:
      'Six interdependent pillars for practitioners who want customer loyalty that actually lasts — not a checklist.',
    url: `${SITE_URL}/loyalty-system`,
    images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630, alt: 'The Loyalty System — Adam Nowak' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Loyalty System | Adam Nowak',
    description:
      'Six interdependent pillars for practitioners who want customer loyalty that actually lasts — not a checklist.',
    images: [`${SITE_URL}/og-default.png`],
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'The Loyalty System',
  description:
    'Six interdependent pillars for building customer loyalty that lasts — for practitioners, not a checklist.',
  url: 'https://adamnowak.online/loyalty-system',
  author: {
    '@type': 'Person',
    name: 'Adam Nowak',
    url: 'https://adamnowak.online',
  },
}

export default function LoyaltySystemPage() {
  const pillars = getAllPillars()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      {/* Hero */}
      <section className="bg-[var(--ink)] text-[var(--paper)] px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--green)] mb-6">
            The Loyalty System
          </p>
          <h1 className="font-serif text-4xl md:text-6xl leading-tight mb-8">
            The biggest mistake in loyalty{' '}
            <em className="text-[var(--green)] not-italic">
              is a missing system.
            </em>
          </h1>
          <p className="text-lg text-[var(--paper)]/70 max-w-xl leading-relaxed mb-4">
            Most advice on loyalty comes in isolated pieces — a tip on
            segmentation here, a rule for rewards there. Put them all in the
            same room and half of them contradict each other.
          </p>
          <p className="text-lg text-[var(--paper)]/70 max-w-xl leading-relaxed">
            These six pillars aren&apos;t a checklist. Each one leans on the
            others — get the customer view wrong, and everything built on top
            of it inherits the mistake.
          </p>
        </div>
      </section>

      {/* Pillars grid */}
      <section className="bg-[var(--paper)] px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--ink)]/40 mb-12">
            Six pillars
          </p>
          <div className="divide-y divide-[var(--ink)]/10">
            {pillars.map((pillar) => (
              <Link
                key={pillar.slug}
                href={`/loyalty-system/${pillar.slug}`}
                className="group flex gap-8 py-10 items-start hover:opacity-100 transition-opacity"
              >
                <span className="font-display text-5xl text-[var(--ink)]/10 group-hover:text-[var(--green)] transition-colors leading-none pt-1 min-w-[3rem]">
                  {String(pillar.pillar).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h2 className="font-serif text-2xl text-[var(--ink)] mb-2 group-hover:text-[var(--teal)] transition-colors">
                    {pillar.title}
                  </h2>
                  <p className="text-sm text-[var(--ink)]/50 leading-relaxed mb-3">
                    {pillar.headline}
                  </p>
                  <p className="text-sm text-[var(--ink)]/60 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
                <span className="text-[var(--ink)]/20 group-hover:text-[var(--teal)] transition-colors text-xl pt-2">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
