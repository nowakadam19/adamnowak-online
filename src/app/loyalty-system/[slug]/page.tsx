import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import {
  getAllPillars,
  getPillar,
  getAdjacentPillars,
  PILLAR_SLUGS,
} from '@/lib/loyalty-system'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return PILLAR_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pillar = getPillar(slug)
  if (!pillar) return {}
  return {
    title: `${pillar.title} — The Loyalty System`,
    description: pillar.description,
    openGraph: {
      title: pillar.title,
      description: pillar.description,
      url: `https://adamnowak.online/loyalty-system/${pillar.slug}`,
    },
  }
}

const MDX_COMPONENTS = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="font-display text-[10px] tracking-[0.2em] uppercase text-[var(--ink)]/40 mt-14 mb-4 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[var(--ink)]/10"
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="font-serif text-xl text-[var(--ink)] mt-8 mb-3"
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      {...props}
      className="text-[15px] leading-[1.8] text-[var(--ink)]/70 mb-4"
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong
      {...props}
      className="font-medium text-[var(--ink)] block mt-6 mb-1"
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="space-y-2 my-4" />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li
      {...props}
      className="text-[15px] leading-[1.8] text-[var(--ink)]/70 pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-[var(--amber)]"
    />
  ),
}

export default async function PillarPage({ params }: Props) {
  const { slug } = await params
  const pillar = getPillar(slug)
  if (!pillar) notFound()

  const allPillars = getAllPillars()
  const { prev, next } = getAdjacentPillars(slug)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pillar.headline,
    name: pillar.title,
    description: pillar.description,
    url: `https://adamnowak.online/loyalty-system/${pillar.slug}`,
    isPartOf: {
      '@type': 'CollectionPage',
      name: 'The Loyalty System',
      url: 'https://adamnowak.online/loyalty-system',
    },
    author: {
      '@type': 'Person',
      name: 'Adam Nowak',
      url: 'https://adamnowak.online',
    },
    keywords: pillar.tags.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="bg-[var(--paper)] min-h-screen">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-[var(--ink)]/8 px-6 py-4"
        >
          <ol className="flex items-center gap-2 max-w-5xl mx-auto font-display text-[10px] tracking-[0.15em] uppercase text-[var(--ink)]/40">
            <li>
              <Link href="/" className="hover:text-[var(--ink)] transition-colors">
                Adam Nowak
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li>
              <Link
                href="/loyalty-system"
                className="hover:text-[var(--ink)] transition-colors"
              >
                Loyalty System
              </Link>
            </li>
            <li aria-hidden>·</li>
            <li className="text-[var(--ink)]">{pillar.title}</li>
          </ol>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-16">
          {/* Main content */}
          <main>
            {/* Progress */}
            <div className="h-px bg-[var(--ink)]/8 mb-10 relative">
              <div
                className="absolute top-0 left-0 h-px bg-[var(--teal)] transition-all"
                style={{ width: `${(pillar.pillar / 6) * 100}%` }}
              />
            </div>

            {/* Header */}
            <header className="mb-14 relative">
              <p className="font-display text-[10px] tracking-[0.2em] uppercase text-[var(--amber)] mb-4">
                Pillar {String(pillar.pillar).padStart(2, '0')} of 06
              </p>
              <h1 className="font-serif text-3xl md:text-[42px] leading-tight text-[var(--ink)] max-w-xl mb-4">
                {pillar.headline}
              </h1>
              <p className="text-xl font-serif text-[var(--ink)]/40 italic">
                {pillar.title}
              </p>
              <span
                aria-hidden
                className="absolute right-0 top-0 font-serif text-[120px] leading-none text-[var(--ink)]/5 select-none"
              >
                {String(pillar.pillar).padStart(2, '0')}
              </span>
            </header>

            {/* MDX content */}
            <article className="max-w-[640px]">
              <MDXRemote source={pillar.content} components={MDX_COMPONENTS} />
            </article>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-14 pt-10 border-t border-[var(--ink)]/8">
              {pillar.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-display text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 border border-[var(--ink)]/15 text-[var(--ink)]/40 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Prev / Next */}
            <nav
              aria-label="Pillar navigation"
              className="flex justify-between mt-10 gap-4"
            >
              {prev ? (
                <Link
                  href={`/loyalty-system/${prev.slug}`}
                  className="group flex flex-col gap-1 flex-1"
                >
                  <span className="font-display text-[9px] tracking-[0.15em] uppercase text-[var(--ink)]/30 group-hover:text-[var(--teal)] transition-colors">
                    ← Previous
                  </span>
                  <span className="font-serif text-base text-[var(--ink)]/60 group-hover:text-[var(--teal)] transition-colors">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {next && (
                <Link
                  href={`/loyalty-system/${next.slug}`}
                  className="group flex flex-col gap-1 flex-1 items-end text-right"
                >
                  <span className="font-display text-[9px] tracking-[0.15em] uppercase text-[var(--ink)]/30 group-hover:text-[var(--teal)] transition-colors">
                    Next →
                  </span>
                  <span className="font-serif text-base text-[var(--ink)]/60 group-hover:text-[var(--teal)] transition-colors">
                    {next.title}
                  </span>
                </Link>
              )}
            </nav>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="font-display text-[9px] tracking-[0.2em] uppercase text-[var(--ink)]/30 mb-5">
                The Loyalty System
              </p>
              <div className="h-px bg-[var(--ink)]/8 mb-5 relative">
                <div
                  className="absolute top-0 left-0 h-px bg-[var(--teal)]"
                  style={{ width: `${(pillar.pillar / 6) * 100}%` }}
                />
              </div>
              <nav aria-label="All pillars">
                <ul className="space-y-0 divide-y divide-[var(--ink)]/8">
                  {allPillars.map((p) => {
                    const isActive = p.slug === pillar.slug
                    return (
                      <li key={p.slug}>
                        <Link
                          href={`/loyalty-system/${p.slug}`}
                          className={`flex gap-3 items-start py-3 transition-colors ${
                            isActive
                              ? 'text-[var(--teal)]'
                              : 'text-[var(--ink)]/40 hover:text-[var(--ink)]'
                          }`}
                        >
                          <span className="font-display text-[9px] tracking-[0.1em] uppercase mt-0.5 min-w-[20px]">
                            {String(p.pillar).padStart(2, '0')}
                          </span>
                          <span className="text-[12px] leading-snug">
                            {p.title}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
