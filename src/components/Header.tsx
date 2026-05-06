'use client'

import Link from 'next/link'

const NAV_LINKS = [
  { href: '/blog', label: 'Thinking' },
  { href: '/loyalty-system', label: 'Loyalty System' },
  { href: '/about', label: 'About' },
]

export default function Header() {
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

      <nav className="hidden md:flex gap-7">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-[11px] font-bold tracking-[0.1em] uppercase transition-colors duration-200 no-underline"
            style={{ fontFamily: 'var(--font-syne)', color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
