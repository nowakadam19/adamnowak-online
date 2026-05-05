'use client'

import Link from 'next/link'
import type { PostMeta } from '@/lib/posts'
import { useLang } from './LangProvider'

const PILLARS: { num: string; en: string; pl: string }[] = [
  { num: '01', en: "Know who you're talking to", pl: 'Poznaj swoich klientów' },
  { num: '02', en: 'Start with people, not products', pl: 'Zacznij od ludzi, nie produktów' },
  { num: '03', en: 'Give before you ask', pl: 'Dawaj zanim poprosisz' },
  { num: '04', en: 'Your best customers are already here', pl: 'Twoi najlepsi klienci już tu są' },
  { num: '05', en: 'Prove it pays', pl: 'Udowodnij że to się opłaca' },
  { num: '06', en: "Make data everyone's job", pl: 'Dane to zadanie dla wszystkich' },
]

function formatDate(dateStr: string, lang: 'en' | 'pl') {
  const date = new Date(dateStr)
  return date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'pl-PL', {
    year: 'numeric',
    month: 'short',
  })
}

export default function HomeClient({ posts }: { posts: PostMeta[] }) {
  const { lang } = useLang()
  const t = (en: string, pl: string) => lang === 'en' ? en : pl

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="flex flex-col justify-center min-h-screen mx-auto max-w-[760px] px-6 md:px-12"
        style={{ paddingTop: '60px' }}
      >
        <div
          className="animate-fade-up-1 flex items-center gap-3 mb-8"
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
          }}
        >
          <span
            className="block shrink-0"
            style={{ width: '28px', height: '1px', background: 'var(--amber)' }}
          />
          {t('Customer Loyalty Intelligence', 'Wiedza o Lojalności Klientów')}
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
          dangerouslySetInnerHTML={{
            __html: t(
              'Customer loyalty is full of noise.<br><em style="font-style:italic;color:var(--amber)">This is the signal.</em>',
              'Marketing lojalności pełen jest szumu.<br><em style="font-style:italic;color:var(--amber)">Tu znajdziesz sygnał.</em>'
            ),
          }}
        />

        <p
          className="animate-fade-up-3 mb-12"
          style={{
            fontSize: '17px',
            color: 'var(--muted)',
            maxWidth: '520px',
            lineHeight: 1.7,
          }}
        >
          {t(
            'Practical thinking on loyalty, CRM, and customer marketing — for practitioners who want clarity, not complexity.',
            'Praktyczna wiedza o lojalności, CRM i marketingu klientów — dla praktyków, którzy szukają jasności, nie złożoności.'
          )}
        </p>

        <Link
          href="/blog"
          className="animate-fade-up-4 inline-flex items-center gap-2 no-underline transition-all duration-200 hover:gap-3"
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
          }}
        >
          {t('Explore the thinking', 'Przeglądaj artykuły')} →
        </Link>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', maxWidth: '760px', margin: '0 auto' }} />

      {/* ── THINKING ─────────────────────────────────────────── */}
      <section
        id="thinking"
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
            <span style={{ width: '20px', height: '1px', background: 'var(--amber)', display: 'inline-block' }} />
            {t('Latest thinking', 'Ostatnie teksty')}
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
              color: 'var(--amber)',
            }}
          >
            {t('All articles', 'Wszystkie artykuły')}
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
                        color: 'var(--amber)',
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
                    {formatDate(post.date, lang)}
                  </time>
                  {' · '}{post.readTime} min
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── BLUEPRINT ────────────────────────────────────────── */}
      <section aria-label="Customer Marketing Blueprint" style={{ background: 'var(--ink)' }}>
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
                color: 'rgba(245,240,232,0.4)',
              }}
            >
              <span style={{ width: '20px', height: '1px', background: 'var(--amber)', display: 'inline-block' }} />
              {t('The Blueprint', 'Blueprint')}
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
              __html: t(
                'New to loyalty marketing?<br><em style="font-style:italic;color:#e8a050">Start here.</em>',
                'Zaczynasz w marketingu lojalności?<br><em style="font-style:italic;color:#e8a050">Zacznij tutaj.</em>'
              ),
            }}
          />

          <p
            className="mb-10"
            style={{
              fontSize: '16px',
              color: 'rgba(245,240,232,0.65)',
              maxWidth: '520px',
              lineHeight: 1.7,
            }}
          >
            {t(
              'The Customer Marketing Blueprint is a structured guide to building customer loyalty that lasts — six pillars, in order, with everything you need to go from zero to running.',
              'Customer Marketing Blueprint to ustrukturyzowany przewodnik po budowaniu trwałej lojalności klientów — sześć filarów, w kolejności, ze wszystkim czego potrzebujesz.'
            )}
          </p>

          <Link
            href="/blueprint"
            className="inline-block no-underline transition-colors duration-200 px-7 py-3.5"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              background: 'var(--paper)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--amber)'
              e.currentTarget.style.color = 'var(--paper)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--paper)'
              e.currentTarget.style.color = 'var(--ink)'
            }}
          >
            {t('Explore the Blueprint', 'Poznaj Blueprint')}
          </Link>

          <nav
            className="grid mt-12"
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: '1px solid rgba(245,240,232,0.1)',
            }}
            aria-label="Blueprint pillars"
          >
            {PILLARS.map(({ num, en, pl }) => (
              <div
                key={num}
                className="py-7 pr-6"
                style={{ borderBottom: '1px solid rgba(245,240,232,0.1)' }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '40px',
                    fontWeight: 300,
                    color: 'rgba(245,240,232,0.12)',
                    lineHeight: 1,
                    marginBottom: '10px',
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.7)',
                    lineHeight: 1.4,
                  }}
                >
                  {t(en, pl)}
                </div>
              </div>
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
            <span style={{ width: '20px', height: '1px', background: 'var(--amber)', display: 'inline-block' }} />
            {t('About', 'O mnie')}
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
              __html: t(
                "I've spent 15+ years at the intersection of CRM, loyalty, and human behaviour — across EMEA, NAM, and APAC. I write to make this field <em style=\"font-style:italic;color:var(--amber)\">simpler and more honest</em> than most people leave it.",
                "Spędziłem ponad 15 lat na styku CRM, lojalności i ludzkiego zachowania — w EMEA, NAM i APAC. Piszę po to, żeby ta dziedzina była <em style=\"font-style:italic;color:var(--amber)\">prostsza i bardziej uczciwa</em> niż większość ludzi ją pozostawia."
              ),
            }}
          />
        </div>
      </aside>
    </>
  )
}
