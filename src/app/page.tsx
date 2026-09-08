import { getAllPosts } from '@/lib/posts'
import HomeClient from '@/components/HomeClient'
import { HERO_VARIANTS } from '@/lib/heroVariants'

// The hero H1 + lead rotate deterministically by UTC date: one variant is chosen
// here on the server and served to every visitor for the whole UTC day. Rendering
// per request (never on the client) means no load-time flicker and a stable
// headline for crawlers. Adding a variant to HERO_VARIANTS extends the rotation
// automatically — the modulo below adapts to the array length.
export const dynamic = 'force-dynamic'

// Whole days since the UTC epoch, modulo the number of variants. Kept out of the
// component body: reading the clock is deliberately impure (a new value per
// request drives the daily rotation), which is exactly what makes the page dynamic.
function currentHeroVariantIndex(): number {
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  return dayIndex % HERO_VARIANTS.length
}

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3)
  return <HomeClient posts={posts} variantIndex={currentHeroVariantIndex()} />
}
