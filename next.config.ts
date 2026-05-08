import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import rehypeRaw from 'rehype-raw'

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter'],
    rehypePlugins: [rehypeRaw],
  },
})

export default withMDX(nextConfig)
