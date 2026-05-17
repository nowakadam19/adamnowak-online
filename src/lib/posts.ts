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

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'))

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
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

