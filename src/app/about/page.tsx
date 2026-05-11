'use client'

import type { Metadata } from 'next'
import Image from 'next/image'
import { useState } from 'react'

const SITE_URL = 'https://www.adamnowak.online'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Customer loyalty and CRM strategist. 15+ years building programs across EMEA — IKEA FAMILY, Electrolux, Avis Budget Group International.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About | Adam Nowak',
    description:
      'Customer loyalty and CRM strategist. 15+ years building programs across EMEA — IKEA FAMILY, Electrolux, Avis Budget Group International.',
    url: `${SITE_URL}/about`,
    type: 'profile',
    images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630, alt: 'Adam Nowak' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Adam Nowak',
    description:
      'Customer loyalty and CRM strategist. 15+ years building programs across EMEA — IKEA FAMILY, Electrolux, Avis Budget Group International.',
    images: [`${SITE_URL}/og-default.png`],
  },
}

const stats = [
  { value: '15+', label: 'Years' },
  { value: '30+', label: 'Markets' },
  { value: '3', label: 'Continents' },
]

const recommendations = [
  {
    quote:
      'Adam is rare proof that you can combine deep strategic and business acumen, people skills and making things happen. If you have any CRM and loyalty challenge — he is capable of solving it in no time.',
    name: 'Justyna Broclawik',
    title: 'Senior Manager, Personalisation & Orchestration — LEGO Group',
    linkedIn: 'https://www.linkedin.com/in/justynabroclawik/',
  },
  {
    quote:
      'Adam told me something I strongly agreed with: organisations need people who can zoom in on the details and zoom out on the paradigm shifts simultaneously. Adam is one of those people.',
    name: 'Bartosz Narzelski',
    title: 'Product & Team, Venture Builder',
    linkedIn: 'https://www.linkedin.com/in/bartosznarzelski/',
  },
  {
    quote:
      'He is a true loyalty expert, driving strategies that create meaningful engagement and results — calm, organised, and one of the best managers I have had in recent years.',
    name: 'Himanshi Dhingra',
    title: 'CRM & Lifecycle Marketing Lead',
    linkedIn: 'https://www.linkedin.com/in/himanshi-dhingra/',
  },
  {
    quote:
      'A top-class expert with an excellent understanding of the role of loyalty programs. The projects we co-managed were awarded in many contests.',
    name: 'Przemysław Orłowski',
    title: 'Co-founder, Loyalty Point',
    linkedIn: 'https://www.linkedin.com/in/przemyslaworlowski/',
  },
  {
    quote: "Adam's blog is my go-to place for the latest trends and topics uncommonly raised in loyalty and CRM. He has been my mentor and close coworker at IKEA — and someone I still turn to for advice to this day.",
    name: 'Marta Dragović',
    title: 'Customer Engagement & Loyalty, CRM — Brand Management',
    linkedIn: 'https://www.linkedin.com/in/marta-dragovic/',
  },
  {
    quote: 'Adam is a great example of a leader who drives topics with passion and engagement. One of the best experts in loyalty that I have had the pleasure to work with.',
    name: 'Dominik Olejko',
    title: 'Customer Experience & Loyalty Executive — Top 50 Retail Voice, NRF',
    linkedIn: 'https://www.linkedin.com/in/dominik-olejko/',
  },
  {
    quote: 'Adam prepared workshops for my Customer Experience Leaders team on building customer engagement. He adjusted the scope to our needs and worked from real examples — not only an expert in his field, but an open and engaged business partner.',
    name: 'Kamila Popławska-Bernatowicz',
    title: 'Marketing & Customer Experience Business Partner, Central Europe',
    linkedIn: 'https://www.linkedin.com/in/kamilapoplawskabernatowicz/',
  },
  {
    quote: 'Nearly 8 years of working together gave me confidence: Adam has exceptional knowledge of customer loyalty, a strong instinct for trends, and a remarkable ability to explain complex things simply. A pleasure to learn from.',
    name: 'Marika Rybarczyk',
    title: 'C-level Executive, CEO & Strategist',
    linkedIn: 'https://www.linkedin.com/in/marikaRybarczyk/',
  },
]

export default function AboutPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div
      className="mx-auto max-w-[760px] px-6 md:px-12"
      style={{ paddingTop: 'calc(72px + 60px)', paddingBottom: '96px' }}
    >
      {/* Hero — split layout */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-14 mb-16">
        {/* Photo */}
        <div className="flex justify-center md:justify-start mb-10 md:mb-0 md:shrink-0">
          <Image
            src="/adam-nowak.jpg"
            alt="Adam Nowak"
            width={240}
            height={300}
            priority
            style={{
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 4px 24px rgba(10,10,8,0.10)',
              width: '200px',
              height: '250px',
            }}
          />
        </div>

        {/* H1 + stats */}
        <div>
          <h1
            className="mb-8"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(34px, 4vw, 48px)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
            }}
          >
            Fifteen years building loyalty programs across EMEA.{' '}
            <span style={{ color: 'var(--green)' }}>The complexity is the advantage.</span>
          </h1>

          {/* Stats */}
          <div className="flex gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '32px',
                    fontWeight: 400,
                    lineHeight: 1,
                    color: 'var(--green)',
                    marginBottom: '4px',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ fontSize: '17px', lineHeight: 1.75, color: 'var(--ink)' }}>
        <p className="mb-6">
          I&apos;ve spent fifteen years on a simple conviction: brands earn loyalty by being loyal first.
        </p>
        <p className="mb-6">
          That means being genuinely curious about what customers want, rewarding the behaviours
          that matter to them, and using every trace they leave to drive value back in their
          direction. The data is a responsibility. The program is the proof.
        </p>
        <p className="mb-6">
          I&apos;ve worked at every level this requires. At IKEA I built IKEA FAMILY from store
          level through country strategy to global frameworks — the full stack, from a single market
          mechanic to a model that travelled. At Electrolux I led loyalty and CRM across 30+ markets
          in Europe and Asia. At Avis Budget Group International I now lead EMEA loyalty strategy.
        </p>
        <p className="mb-16">
          The multicultural complexity isn&apos;t a constraint. It&apos;s where the real thinking happens.
        </p>

        <h2
          className="mb-6"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(26px, 3vw, 32px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          What I work on
        </h2>
        <p className="mb-16">
          Loyalty program strategy and architecture. CRM and lifecycle marketing. Behavioral
          economics applied to customer engagement. Customer strategy for multinational environments.
        </p>

        <h2
          className="mb-6"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(26px, 3vw, 32px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          Who I work with
        </h2>

        <div className="mb-8">
          <p
            className="mb-2"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--green)',
            }}
          >
            Loyalty and CRM practitioners
          </p>
          <p>
            Managers and directors running programs who need a thought partner with multinational
            scale experience. Usually there&apos;s a specific problem: a program that isn&apos;t
            converting, a market expansion that isn&apos;t landing, a framework the team can
            actually use. That&apos;s the conversation I&apos;m good at.
          </p>
        </div>

        <div className="mb-16">
          <p
            className="mb-2"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--green)',
            }}
          >
            Agencies and consultancies
          </p>
          <p>
            Teams brought in to design or audit a loyalty program who want an external expert with
            real program P&amp;L experience — not just strategic frameworks. I&apos;ve been the
            client for fifteen years. That perspective changes what I build with you.
          </p>
        </div>

        <h2
          className="mb-10"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(26px, 3vw, 32px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          What others say
        </h2>

        <div className="mb-16" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {recommendations.map((rec, i) => (
            <div
              key={rec.name}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                borderLeft: '2px solid var(--green)',
                paddingLeft: '22px',
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingRight: '16px',
                marginLeft: '-2px',
                borderRadius: '0 8px 8px 0',
                transition: 'background 0.2s, box-shadow 0.2s',
                backgroundColor: hoveredIndex === i ? 'var(--paper)' : 'transparent',
                boxShadow: hoveredIndex === i ? '0 2px 16px rgba(10,10,8,0.06)' : 'none',
              }}
            >
              <p
                className="mb-4"
                style={{
                  fontSize: '17px',
                  lineHeight: 1.7,
                  color: 'var(--ink)',
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{rec.quote}&rdquo;
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                }}
              >
                <a
                  href={rec.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '1px',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderBottomColor = 'var(--green)')}
                  onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'var(--border)')}
                >
                  {rec.name}
                </a>
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.06em',
                  color: 'var(--muted)',
                  marginTop: '2px',
                }}
              >
                {rec.title}
              </p>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
          <p className="mb-6" style={{ fontSize: '17px', lineHeight: 1.75 }}>
            If you want to talk loyalty strategy, compare notes on a program, or explore working
            together — LinkedIn is the best place to reach me.
          </p>

            href="https://www.linkedin.com/in/adam-nowak/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--green)',
              textDecoration: 'none',
            }}
          >
            Connect on LinkedIn →
          </a>
        </div>
      </div>
    </div>
  )
}
