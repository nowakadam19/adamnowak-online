'use client'

import Link from 'next/link'
import { useLang } from './LangProvider'

export default function Footer() {
  const { lang } = useLang()
  const t = (en: string, pl: string) => lang === 'en' ? en : pl

  return (
    <footer
      className="flex items-center justify-between flex-wrap gap-4 px-6 md:px-12 py-10 border-t-2"
      style={{ background: 'var(--ink)', borderColor: 'var(--amber)' }}
    >
      <Link
        href="/"
        className="no-underline"
        style={{
          fontFamily: 'var(--font-syne)',
          fontSize: '14px',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(245,240,232,0.6)',
        }}
      >
        Adam<span style={{ color: 'var(--amber)' }}>.</span>Nowak
      </Link>

      <nav>
        <ul className="flex gap-6 list-none">
          {[
            { href: 'https://linkedin.com/in/adamnowak', label: 'LinkedIn', external: true },
            { href: '/newsletter', en: 'Newsletter', pl: 'Newsletter' },
            { href: '/work-with-me', en: 'Work with me', pl: 'Współpraca' },
          ].map(({ href, en, pl, label, external }) => (
            <li key={href}>
              <Link
                href={href}
                {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                className="no-underline transition-colors duration-200"
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,232,0.4)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.4)')}
              >
                {label ?? t(en!, pl!)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <span
        style={{
          fontFamily: 'var(--font-syne)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(245,240,232,0.4)',
        }}
      >
        © 2026 Adam Nowak
      </span>
    </footer>
  )
}
