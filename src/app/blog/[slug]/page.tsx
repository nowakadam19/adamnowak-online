import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllPosts, type PostMeta } from '@/lib/posts'
import ReadingProgressBar from '@/components/blog/ReadingProgressBar'
import ShareButton from '@/components/blog/ShareButton'

const postsDir = path.join(process.cwd(), 'src/content/posts')
const SITE_URL = 'https://www.adamnowak.online'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getAllPosts().find(p => p.slug === slug)
  if (!post) return {}

  const url = `${SITE_URL}/blog/${slug}`
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}`

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${post.title} | Adam Nowak`,
      description: post.excerpt,
      url,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Adam Nowak`,
      description: post.excerpt,
      images: [ogImage],
    },
  }
}

function PostShell({
  title,
  titleHtml,
  date,
  tags,
  readTime,
  related,
  children,
}: {
  title: string
  titleHtml?: string
  date: string
  tags: string[]
  readTime: number
  related: PostMeta[]
  children: React.ReactNode
}) {
  const formatted = new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      className="mx-auto max-w-[760px] px-6 md:px-12"
      style={{ paddingTop: 'calc(72px + 60px)', paddingBottom: '72px' }}
    >
      <ReadingProgressBar />
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 no-underline mb-12 transition-colors duration-200 text-muted hover:text-amber"
        style={{
          fontFamily: 'var(--font-syne)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        ← Blog
      </Link>

      <article>
        <header className="mb-12">
          {tags.length > 0 && (
            <div
              className="mb-4"
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--green)',
              }}
            >
              {tags.join(' · ')}
            </div>
          )}
          {titleHtml ? (
            <h1
              className="mb-6"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(38px, 4vw, 52px)',
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
              }}
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />
          ) : (
            <h1
              className="mb-6"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(38px, 4vw, 52px)',
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
              }}
            >
              {title}
            </h1>
          )}
          <div
            className="flex items-center gap-3"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            <time dateTime={date}>{formatted}</time>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span>{readTime} min read</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <ShareButton />
          </div>
        </header>

        {children}
      </article>

      {related.length > 0 && (
        <div style={{ marginTop: '72px', paddingTop: '48px', borderTop: '1px solid var(--border)' }}>
          <div
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '32px',
            }}
          >
            Related
          </div>
          {related.map(post => {
            const postDate = new Date(post.date).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block py-6 no-underline group"
                style={{ borderBottom: '1px solid var(--border)', color: 'inherit' }}
              >
                {post.tags.length > 0 && (
                  <div
                    className="mb-1.5"
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
                <h3
                  className="mb-2 transition-colors duration-200 group-hover:text-amber"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '22px',
                    fontWeight: 500,
                    lineHeight: 1.2,
                    color: 'var(--ink)',
                  }}
                >
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mb-3" style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65 }}>
                    {post.excerpt}
                  </p>
                )}
                <div
                  className="flex items-center gap-3"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  <time dateTime={post.date}>{postDate}</time>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span>{post.readTime} min read</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ArticleJsonLd({ title, excerpt, date, slug }: { title: string; excerpt: string; date: string; slug: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    datePublished: date,
    author: {
      '@type': 'Person',
      name: 'Adam Nowak',
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Person',
      name: 'Adam Nowak',
      url: SITE_URL,
    },
    url: `${SITE_URL}/blog/${slug}`,
    image: `${SITE_URL}/og-default.png`,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

function getRelated(slug: string, tags: string[], all: PostMeta[]): PostMeta[] {
  const others = all.filter(p => p.slug !== slug)
  const tagged = others.filter(p => p.tags.some(t => tags.includes(t))).slice(0, 3)
  return tagged.length > 0 ? tagged : others.slice(0, 2)
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const allPosts = getAllPosts()
  const meta = allPosts.find(p => p.slug === slug)
  if (!meta) notFound()

  const related = getRelated(slug, meta.tags, allPosts)
  const mdxPath = path.join(postsDir, `${slug}.mdx`)
  const isMdx = fs.existsSync(mdxPath)

  if (isMdx) {
    const { default: Post } = await import(`@/content/posts/${slug}.mdx`)
    return (
      <>
        <ArticleJsonLd title={meta.title} excerpt={meta.excerpt} date={meta.date} slug={slug} />
        <PostShell
          title={meta.title}
          titleHtml={meta.titleHtml}
          date={meta.date}
          tags={meta.tags}
          readTime={meta.readTime}
          related={related}
        >
          <Post />
        </PostShell>
      </>
    )
  }

  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <>
      <ArticleJsonLd title={post.title} excerpt={post.excerpt} date={post.date} slug={slug} />
      <PostShell
        title={post.title}
        titleHtml={post.titleHtml}
        date={post.date}
        tags={post.tags}
        readTime={post.readTime}
        related={related}
      >
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </PostShell>
    </>
  )
}
