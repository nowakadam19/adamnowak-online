import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles on customer loyalty, CRM, pricing psychology and behavioural marketing.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="mx-auto max-w-[760px] px-6 md:px-12 py-[72px]" style={{ paddingTop: 'calc(72px + 60px)' }}>
      <h1
        className="mb-10"
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(32px, 4vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        Blog
      </h1>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No articles yet.</p>
      ) : (
        <div role="list">
          {posts.map(post => {
            const date = new Date(post.date).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
            })
            return (
              <article key={post.slug} role="listitem">
                <Link
                  href={`/blog/${post.slug}`}
                  className="grid gap-6 py-7 no-underline group"
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
                      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.65 }}>
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
                    <time dateTime={post.date}>{date}</time>
                    {' · '}{post.readTime} min
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
