'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: 'https://linkedin.com/in/adam-nowak', label: 'LinkedIn', external: true },
]

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer
      className="px-6 md:px-12 pt-10 pb-8 border-t-2"
      style={{ background: 'var(--ink)', borderColor: 'var(--green)' }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
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
          Adam<span style={{ color: 'var(--green)' }}>.</span>Nowak
        </Link>

        <nav>
          <ul className="flex gap-6 list-none">
            {NAV_LINKS.map(({ href, label, external }) => (
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
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.4)')}
                >
                  {label}
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
      </div>

      {pathname !== '/about' && (
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'rgba(245,240,232,0.35)',
            borderTop: '1px solid rgba(245,240,232,0.08)',
            paddingTop: '20px',
            margin: 0,
          }}
        >
          Content on this site is AI-assisted. I take care to ensure accuracy, but errors may appear.
          This site is primarily a personal learning project — please read critically and verify
          information independently.
        </p>
      )}
    </footer>
  )
}
