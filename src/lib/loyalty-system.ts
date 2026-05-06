import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content/loyalty-system')

export interface PillarMeta {
  slug: string
  pillar: number
  title: string
  headline: string
  description: string
  tags: string[]
}

export interface Pillar extends PillarMeta {
  content: string
}

export const PILLAR_SLUGS = [
  'know-who-youre-talking-to',
  'start-with-people-not-products',
  'give-before-you-ask',
  'your-best-customers-are-already-here',
  'prove-it-pays',
  'make-data-everyones-job',
] as const

export type PillarSlug = typeof PILLAR_SLUGS[number]

export function getAllPillars(): PillarMeta[] {
  return PILLAR_SLUGS.map((slug) => {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(fileContent)
    return { slug, ...data } as PillarMeta
  })
}

export function getPillar(slug: string): Pillar | null {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    return { slug, ...data, content } as Pillar
  } catch {
    return null
  }
}

export function getAdjacentPillars(currentSlug: string): {
  prev: PillarMeta | null
  next: PillarMeta | null
} {
  const index = PILLAR_SLUGS.indexOf(currentSlug as PillarSlug)
  const all = getAllPillars()
  return {
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  }
}
