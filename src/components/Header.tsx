'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/blog', label: 'Blog' },
  { href: '/loyalty-system', label: 'Loyalty System' },
  { href: '/about', label: 'About' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[60px] px-6 md:px-12 border-b"
        style={{ background: 'var(--paper)', borderColor: 'var(--border)' }}
      >
        <Link href="/" className="no-underline">
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em' }}>
            <span style={{ color: 'var(--ink)' }}>Adam.</span>
            <span style={{ color: 'var(--amber)' }}>Nowak</span>
          </span>
        </Link>

        {/* Desktop nav */}
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

        {/* Hamburger button */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 p-1"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span
            style={{
              display: 'block',
              height: '1.5px',
              background: 'var(--ink)',
              transformOrigin: 'center',
              transition: 'transform 0.2s, opacity 0.2s',
              transform: open ? 'translateY(6.5px) rotate(45deg)' : 'none',
            }}
          />
          <span
            style={{
              display: 'block',
              height: '1.5px',
              background: 'var(--ink)',
              transition: 'opacity 0.2s',
              opacity: open ? 0 : 1,
            }}
          />
          <span
            style={{
              display: 'block',
              height: '1.5px',
              background: 'var(--ink)',
              transformOrigin: 'center',
              transition: 'transform 0.2s, opacity 0.2s',
              transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
            }}
          />
        </button>
      </header>

      {/* Mobile menu */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden flex flex-col pt-[60px]"
          style={{ background: 'var(--paper)' }}
        >
          <nav className="flex flex-col px-6 pt-8 gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="no-underline py-4 border-b"
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  borderColor: 'var(--border)',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
