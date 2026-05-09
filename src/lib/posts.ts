import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

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

export interface Post extends PostMeta {
  contentHtml: string
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'))

  return files
    .map(file => {
      const slug = file.replace(/\.(md|mdx)$/, '')
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
      const { data, content } = matter(raw)
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length
      const readTime = Math.max(1, Math.round(wordCount / 200))

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

export async function getPost(slug: string): Promise<Post | null> {
  const mdxPath = path.join(postsDir, `${slug}.mdx`)
  const filePath = fs.existsSync(mdxPath) ? mdxPath : path.join(postsDir, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.round(wordCount / 200))

  const processed = await remark().use(html).process(content)

  return {
    slug,
    title: data.title ?? slug,
    titleHtml: data.titleHtml,
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    tags: data.tags ?? [],
    readTime,
    contentHtml: processed.toString(),
  }
}
