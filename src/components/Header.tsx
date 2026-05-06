'use client'

import Link from 'next/link'
import { useLang } from './LangProvider'

export default function Header() {
  const { lang, toggle } = useLang()
  const t = (en: string, pl: string) => lang === 'en' ? en : pl

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[60px] px-6 md:px-12 border-b"
      style={{ background: 'var(--paper)', borderColor: 'var(--border)' }}
    >
      <Link
        href="/"
        className="font-display text-[14px] font-extrabold tracking-[0.14em] uppercase no-underline"
        style={{ color: 'var(--ink)', fontFamily: 'var(--font-syne)' }}
      >
        Adam<span style={{ color: 'var(--amber)' }}>.</span>Nowak
      </Link>

      <div className="flex items-center gap-8">
        <nav className="hidden md:flex gap-7">
          {[
            { href: '/blog', en: 'Thinking', pl: 'Myślenie' },
            { href: '/loyalty-system', en: 'Loyalty System', pl: 'Loyalty System' },
            { href: '/about', en: 'About', pl: 'O mnie' },
          ].map(({ href, en, pl }) => (
            <Link
              key={href}
              href={href}
              className="text-[11px] font-bold tracking-[0.1em] uppercase transition-colors duration-200 no-underline"
              style={{ fontFamily: 'var(--font-syne)', color: 'var(--muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              {t(en, pl)}
            </Link>
          ))}
        </nav>

        <button
          onClick={toggle}
          className="text-[11px] font-bold tracking-[0.1em] uppercase px-3.5 py-1.5 border transition-all duration-200 cursor-pointer bg-transparent"
          style={{
            fontFamily: 'var(--font-syne)',
            color: 'var(--muted)',
            borderColor: 'var(--border)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--amber)'
            e.currentTarget.style.color = 'var(--amber)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          {lang === 'en' ? 'PL' : 'EN'}
        </button>
      </div>
    </header>
  )
}
