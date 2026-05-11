import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { getAllPillars } from '@/lib/loyalty-system'

const BASE_URL = 'https://www.adamnowak.online'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const pillars = getAllPillars()

  const postEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const pillarEntries: MetadataRoute.Sitemap = pillars.map(pillar => ({
    url: `${BASE_URL}/loyalty-system/${pillar.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/loyalty-system`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...postEntries,
    ...pillarEntries,
  ]
}
