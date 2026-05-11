import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllPosts } from '@/lib/posts'

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
  const ogImage = `${SITE_URL}/og-default.png`

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
  children,
}: {
  title: string
  titleHtml?: string
  date: string
  tags: string[]
  readTime: number
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
          </div>
        </header>

        {children}
      </article>
    </div>
  )
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const meta = getAllPosts().find(p => p.slug === slug)
  if (!meta) notFound()

  const mdxPath = path.join(postsDir, `${slug}.mdx`)
  const isMdx = fs.existsSync(mdxPath)

  if (isMdx) {
    const { default: Post } = await import(`@/content/posts/${slug}.mdx`)
    return (
      <PostShell
        title={meta.title}
        titleHtml={meta.titleHtml}
        date={meta.date}
        tags={meta.tags}
        readTime={meta.readTime}
      >
        <Post />
      </PostShell>
    )
  }

  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <PostShell
      title={post.title}
      titleHtml={post.titleHtml}
      date={post.date}
      tags={post.tags}
      readTime={post.readTime}
    >
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </PostShell>
  )
}
