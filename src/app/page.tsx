import { getAllPosts } from '@/lib/posts'
import HomeClient from '@/components/HomeClient'

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3)
  return <HomeClient posts={posts} />
}
