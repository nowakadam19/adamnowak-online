import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Adam Nowak — Customer loyalty and CRM strategist with 15+ years of experience across EMEA, NAM and APAC.',
}

export default function AboutPage() {
  return (
    <div
      className="mx-auto max-w-[760px] px-6 md:px-12"
      style={{ paddingTop: 'calc(72px + 60px)', paddingBottom: '72px' }}
    >
      <h1
        className="mb-10"
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(38px, 4vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        About
      </h1>

      <div style={{ fontSize: '17px', lineHeight: 1.75, color: 'var(--ink)' }}>
        <p className="mb-6">
          I&apos;m a customer loyalty and CRM strategist with 15+ years of experience
          building retention programmes across EMEA, NAM and APAC.
        </p>

        <p className="mb-6">
          I&apos;ve led loyalty strategy for major retailers, financial services companies,
          and consumer brands — helping them move from discount-driven programmes to
          experience-led systems that compound over time.
        </p>

        <p className="mb-10">
          This site is where I think out loud about what actually works in customer
          marketing: the frameworks, the trade-offs, and the decisions most teams
          get wrong.
        </p>

        <h2
          className="mb-6"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '28px',
            fontWeight: 500,
            color: 'var(--ink)',
          }}
        >
          Experience
        </h2>

        <p className="mb-6">
          I&apos;ve spent seventeen years working in customer loyalty and CRM —
          at store level, country level, and global scale.
        </p>

        <p className="mb-6">
          Most of that time was at IKEA, where I started managing a single
          store&apos;s marketing in Gdańsk and ended up running global loyalty
          strategy from Malmö — overseeing a programme with over 100 million
          members across 30 markets.
        </p>

        <p className="mb-6">
          After IKEA, I took that same approach to Electrolux — building
          global CRM and loyalty infrastructure from Stockholm across EMEA,
          NAM, and APAC. Different industry, different product lifecycle,
          same underlying question: how do you make customers want to come back?
        </p>

        <p className="mb-6">
          I&apos;m now at Avis Budget Group, working on the next generation of
          loyalty for one of the world&apos;s largest mobility brands.
        </p>

        <p className="mb-6">
          Three companies. Three industries. Retail, home appliances,
          mobility. Country roles, regional roles, global roles.
          Poland, Sweden, the UK.
        </p>

        <p>
          This blog is where I write about what I&apos;ve learned — and what
          I&apos;m still figuring out.
        </p>
      </div>
    </div>
  )
}
