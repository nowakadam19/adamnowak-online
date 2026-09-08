import { getAllPosts } from '@/lib/posts'
import HomeClient from '@/components/HomeClient'
import { HERO_VARIANTS } from '@/lib/heroVariants'

// The hero H1 + lead rotate deterministically by UTC date: one variant is chosen
// on the server and served to every visitor for the whole UTC day. Never on the
// client — no load-time flicker, and crawlers see a stable headline in the HTML.
// Adding a variant to HERO_VARIANTS extends the rotation automatically.
//
// The page stays statically generated and CDN-cached; it is only re-rendered once
// an hour. That is deliberately lighter than force-dynamic, which would run the
// server on every single visit just to read the date. The cost is that a new day's
// variant appears within an hour of UTC midnight rather than exactly at it.
export const revalidate = 3600

// Whole days since the UTC epoch, modulo the number of variants. Read once per
// regeneration rather than per request — see the revalidate note above.
function currentHeroVariantIndex(): number {
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  return dayIndex % HERO_VARIANTS.length
}

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3)
  return <HomeClient posts={posts} variantIndex={currentHeroVariantIndex()} />
}
