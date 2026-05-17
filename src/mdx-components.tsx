import type { MDXComponents } from 'mdx/types'

const heading = (tag: 'h1' | 'h2' | 'h3' | 'h4') => {
  const sizes = {
    h1: 'clamp(32px, 4vw, 48px)',
    h2: 'clamp(24px, 3vw, 36px)',
    h3: 'clamp(20px, 2.5vw, 28px)',
    h4: '20px',
  }
  return function Heading({ children }: { children?: React.ReactNode }) {
    const Tag = tag
    return (
      <Tag
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: sizes[tag],
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          marginTop: '2em',
          marginBottom: '0.5em',
        }}
      >
        {children}
      </Tag>
    )
  }
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: heading('h1'),
    h2: heading('h2'),
    h3: heading('h3'),
    h4: heading('h4'),
    p: ({ children }) => (
      <p style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.25em' }}>
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        style={{ color: 'var(--green)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
      >
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05em', fontStyle: 'italic' }}>
        {children}
      </em>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: '2px solid var(--green)',
          paddingLeft: '1.5rem',
          marginLeft: 0,
          marginRight: 0,
          marginTop: '2em',
          marginBottom: '2em',
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(20px, 2.5vw, 26px)',
          fontStyle: 'italic',
          lineHeight: 1.4,
          color: 'var(--ink)',
        }}
      >
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '3em 0' }} />
    ),
    ul: ({ children }) => (
      <ul style={{ paddingLeft: '1.5em', marginBottom: '1.25em', color: 'var(--muted)' }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ paddingLeft: '1.5em', marginBottom: '1.25em', color: 'var(--muted)' }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ marginBottom: '0.4em', lineHeight: 1.7 }}>{children}</li>
    ),
    code: ({ children }) => (
      <code
        style={{
          fontFamily: 'monospace',
          fontSize: '0.875em',
          background: 'var(--cream)',
          padding: '2px 6px',
          borderRadius: '3px',
          color: 'var(--ink)',
        }}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          padding: '1.5rem',
          borderRadius: 0,
          overflowX: 'auto',
          marginTop: '1.5em',
          marginBottom: '1.5em',
          fontSize: '14px',
          lineHeight: 1.6,
        }}
      >
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1.5em', marginBottom: '1.5em', fontSize: '14px', color: 'var(--muted)' }}>
        {children}
      </table>
    ),
    th: ({ children }) => (
      <th style={{ display: 'table-cell', textAlign: 'left', paddingRight: '1.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-syne)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)' }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{ display: 'table-cell', paddingRight: '1.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
        {children}
      </td>
    ),
  }
}
