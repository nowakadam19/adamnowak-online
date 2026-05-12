'use client'

import Link from 'next/link'
import type { PostMeta } from '@/lib/posts'

const PILLARS: { num: string; label: string }[] = [
  { num: '01', label: "Know who you're talking to" },
  { num: '02', label: 'Start with people, not products' },
  { num: '03', label: 'Give before you ask' },
  { num: '04', label: 'Your best customers are already here' },
  { num: '05', label: 'Prove it pays' },
  { num: '06', label: "Make data everyone's job" },
]

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })
}

export default function HomeClient({ posts }: { posts: PostMeta[] }) {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="flex flex-col justify-center min-h-screen mx-auto max-w-[760px] px-6 md:px-12"
        style={{ paddingTop: '60px' }}
      >
        <div className="animate-fade-up-1 mb-8">
          <div
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              lineHeight: 1.1,
              marginBottom: '4px',
            }}
          >
            <span style={{ color: 'var(--ink)' }}>Adam </span>
            <span style={{ color: 'var(--green)' }}>Nowak</span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              opacity: 0.4,
            }}
          >
            Customer Loyalty Intelligence
          </div>
        </div>

        <h1
          className="animate-fade-up-2 mb-8"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 400,
            lineHeight: 1.06,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
          }}
        >
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>
            Customer loyalty
            <br />
            {' '}is full of noise.
          </em>
          <br />
          <span style={{ color: 'var(--green)' }}>This is the signal.</span>
        </h1>

        <p
          className="animate-fade-up-3 mb-12"
          style={{
            fontSize: '17px',
            color: 'var(--muted)',
            maxWidth: '520px',
            lineHeight: 1.7,
          }}
        >
          Practical thinking on loyalty, CRM, and customer marketing — for practitioners who want clarity, not complexity.
        </p>

        <div className="animate-fade-up-4 inline-flex items-center gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 no-underline transition-colors duration-200"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              border: '1.5px solid var(--ink)',
              background: 'transparent',
              padding: '10px 20px',
            }}
          >
            The blog →
          </Link>
          <Link
            href="/loyalty-system"
            className="inline-flex items-center gap-2 no-underline transition-colors duration-200"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              border: '1.5px solid var(--ink)',
              background: 'transparent',
              padding: '10px 20px',
              whiteSpace: 'nowrap',
            }}
          >
            Loyalty System →
          </Link>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', maxWidth: '760px', margin: '0 auto' }} />

      {/* ── THINKING ─────────────────────────────────────────── */}
      <section
        id="blog"
        className="mx-auto max-w-[760px] px-6 md:px-12 py-[72px]"
        aria-label="Latest articles"
      >
        <div
          className="flex items-baseline justify-between mb-10 pb-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center gap-2.5"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            <span style={{ width: '20px', height: '1px', background: 'var(--green)', display: 'inline-block' }} />
            Latest posts
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 no-underline transition-all duration-200 hover:gap-2.5 after:content-['→']"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--green)',
            }}
          >
            All articles
          </Link>
        </div>

        <div role="list">
          {posts.map(post => (
            <article
              key={post.slug}
              role="listitem"
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="grid gap-6 py-7 no-underline transition-colors duration-200 group"
                style={{
                  gridTemplateColumns: '1fr auto',
                  borderBottom: '1px solid var(--border)',
                  color: 'inherit',
                }}
              >
                <div>
                  {post.tags.length > 0 && (
                    <div
                      className="mb-2"
                      style={{
                        fontFamily: 'var(--font-syne)',
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--green)',
                      }}
                    >
                      {post.tags.join(' · ')}
                    </div>
                  )}
                  <h2
                    className="mb-2 transition-colors duration-200 group-hover:text-amber"
                    itemProp="headline"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '24px',
                      fontWeight: 500,
                      lineHeight: 1.2,
                      color: 'var(--ink)',
                    }}
                  >
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p
                      style={{
                        fontSize: '15px',
                        color: 'var(--muted)',
                        lineHeight: 1.65,
                      }}
                      itemProp="description"
                    >
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <div
                  className="hidden md:block pt-1.5 whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  <time itemProp="datePublished" dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                  {' · '}{post.readTime} min
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── LOYALTY SYSTEM ───────────────────────────────────── */}
      <section aria-label="The Loyalty System" style={{ background: 'var(--ink)' }}>
        <div className="mx-auto max-w-[760px] px-6 md:px-12 py-[72px]">
          <div
            className="flex items-baseline justify-between mb-10 pb-4"
            style={{ borderBottom: '1px solid rgba(245,240,232,0.1)' }}
          >
            <div
              className="flex items-center gap-2.5"
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.88)',
              }}
            >
              <span style={{ width: '20px', height: '1px', background: 'var(--green)', display: 'inline-block' }} />
              The Loyalty System
            </div>
          </div>

          <h2
            className="mb-5"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: 'var(--paper)',
            }}
            dangerouslySetInnerHTML={{
              __html: 'New to loyalty marketing?<br><em style="font-style:italic;color:var(--green-on-dark)">Start here.</em>',
            }}
          />

          <p
            className="mb-10"
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.88)',
              maxWidth: '520px',
              lineHeight: 1.7,
            }}
          >
            The Loyalty System is a practical framework for building customer loyalty that lasts — six pillars, each dependent on the others. An ecosystem, not a checklist.
          </p>

          <Link
            href="/loyalty-system"
            className="inline-block no-underline transition-colors duration-200 px-7 py-3.5"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--paper)',
              background: 'transparent',
              border: '1.5px solid var(--paper)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--paper)'
              e.currentTarget.style.color = 'var(--ink)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--paper)'
            }}
          >
            Explore the Loyalty System
          </Link>

          <nav
            className="grid grid-cols-2 md:grid-cols-3 mt-12"
            style={{
              borderTop: '1px solid rgba(245,240,232,0.1)',
            }}
            aria-label="Loyalty System pillars"
          >
            {PILLARS.map(({ num, label }) => (
              <a
                key={num}
                href="/loyalty-system"
                className="py-7 pr-6 no-underline group"
                style={{ borderBottom: '1px solid rgba(245,240,232,0.1)', display: 'block' }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '40px',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1,
                    marginBottom: '10px',
                  }}
                >
                  {num}
                </div>
                <div
                  className="transition-colors duration-200 group-hover:text-[#4CAF7D]"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.95)',
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                </div>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <aside
        className="mx-auto max-w-[760px] px-6 md:px-12 py-16 grid gap-16 md:gap-0"
        style={{
          gridTemplateColumns: 'minmax(0,1fr)',
          borderTop: '1px solid var(--border)',
        }}
        aria-label="About Adam Nowak"
      >
        <div className="md:grid md:gap-16" style={{ gridTemplateColumns: '1fr 2fr' }}>
          <div
            className="flex items-center gap-2.5 mb-6 md:mb-0 md:pt-1.5"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            <span style={{ width: '20px', height: '1px', background: 'var(--green)', display: 'inline-block' }} />
            About
          </div>

          <p
            itemProp="description"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(22px, 2.5vw, 30px)',
              fontWeight: 400,
              lineHeight: 1.35,
              color: 'var(--ink)',
              letterSpacing: '-0.01em',
            }}
            dangerouslySetInnerHTML={{
              __html: "I've spent 15+ years at the intersection of CRM, loyalty, and human behaviour — across EMEA, NAM, and APAC. I write to make this field <em style=\"font-style:italic;color:var(--green)\">simpler and more honest</em> than most people leave it.",
            }}
          />
        </div>
      </aside>
    </>
  )
}
