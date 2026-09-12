import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'src/content/posts')

export interface PostMeta {
  slug: string
  title: string
  titleHtml?: string
  date: string
  excerpt: string
  tags: string[]
  readTime: number
}

// The frontmatter date doubles as a publication schedule: a post dated ahead of
// today stays out of every listing until that day arrives. Compared by calendar
// day in UTC, like the hero rotation on the home page, so the cutoff does not
// move with the build machine's clock.
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
  const today = todayUtc()

  return files
    .map(file => {
      const slug = file.replace(/\.(md|mdx)$/, '')
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
      const { data, content } = matter(raw)
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length
      const readTime = Math.max(1, Math.ceil(wordCount / 200))

      return {
        slug,
        title: data.title ?? slug,
        titleHtml: data.titleHtml,
        date: data.date ?? '',
        excerpt: data.excerpt ?? '',
        tags: data.tags ?? [],
        readTime,
      }
    })
    .filter(post => String(post.date).slice(0, 10) <= today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
