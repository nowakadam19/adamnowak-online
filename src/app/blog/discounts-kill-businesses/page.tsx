import type { Metadata } from 'next'
import ProfitChart from '@/components/article/ProfitChart'

export const metadata: Metadata = {
  title: 'Discounts Kill Businesses. Pricing Psychology Saves Them.',
  description:
    'A 1% price increase can lift operating profit by roughly 8–10% if volume holds. On single-digit margins, a modest discount can erase most of your profit.',
}

// ── Design tokens ─────────────────────────────────────────────
const f = {
  syne: 'var(--font-syne)',
  serif: 'var(--font-cormorant)',
}

// ── Sub-components ────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: f.syne,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        marginTop: '56px',
      }}
    >
      <span
        style={{ width: '24px', height: '1px', background: 'var(--amber)', flexShrink: 0 }}
      />
      {children}
    </div>
  )
}

function VisualBlock({
  label,
  children,
  noPad = false,
}: {
  label: string
  children: React.ReactNode
  noPad?: boolean
}) {
  return (
    <div
      style={{
        margin: '40px 0',
        border: '1px solid var(--border)',
        background: 'var(--paper)',
      }}
    >
      <div
        style={{
          fontFamily: f.syne,
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--cream)',
        }}
      >
        {label}
      </div>
      {noPad ? children : <div style={{ padding: '32px' }}>{children}</div>}
    </div>
  )
}

function TechniqueCard({
  tag, tagBg, tagColor,
  title, desc, lift, liftColor,
}: {
  tag: string; tagBg: string; tagColor: string
  title: string; desc: React.ReactNode; lift: string; liftColor: string
}) {
  return (
    <div style={{ background: 'var(--paper)', padding: '28px 24px' }}>
      <span
        style={{
          fontFamily: f.syne,
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '3px 10px',
          display: 'inline-block',
          marginBottom: '14px',
          background: tagBg,
          color: tagColor,
        }}
      >
        {tag}
      </span>
      <div
        style={{
          fontFamily: f.serif,
          fontSize: '22px',
          fontWeight: 400,
          color: 'var(--ink)',
          marginBottom: '10px',
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--muted)',
          lineHeight: 1.65,
          marginBottom: '14px',
        }}
      >
        {desc}
      </p>
      <div
        style={{
          fontFamily: f.syne,
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: liftColor,
        }}
      >
        {lift}
      </div>
    </div>
  )
}

function TierCard({
  name, price, desc, badge, featured = false,
}: {
  name: string; price: string; desc: string; badge?: string; featured?: boolean
}) {
  return (
    <div
      style={{
        border: featured ? '2px solid var(--ink)' : '1px solid var(--border)',
        padding: '20px 16px',
        textAlign: 'center',
        background: featured ? 'var(--ink)' : 'var(--paper)',
      }}
    >
      {badge && (
        <div
          style={{
            fontFamily: f.syne,
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
            marginBottom: '4px',
          }}
        >
          {badge}
        </div>
      )}
      <div
        style={{
          fontFamily: f.syne,
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: featured ? 'var(--amber)' : 'var(--muted)',
          marginBottom: '8px',
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: f.serif,
          fontSize: '36px',
          fontWeight: 300,
          color: featured ? '#f5f0e8' : 'var(--ink)',
          lineHeight: 1,
          marginBottom: '8px',
        }}
      >
        {price}
      </div>
      <div
        style={{
          fontFamily: f.syne,
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: featured ? 'rgba(245,240,232,0.6)' : 'var(--muted)',
        }}
      >
        {desc}
      </div>
    </div>
  )
}

function SaasTierCard({
  name, price, suffix, desc, badge, featured = false,
}: {
  name: string; price: string; suffix: string; desc: string; badge?: string; featured?: boolean
}) {
  return (
    <div
      style={{
        border: featured ? '2px solid var(--ink)' : '1px solid var(--border)',
        padding: '20px 16px',
        textAlign: 'center',
        background: featured ? 'var(--ink)' : 'var(--paper)',
      }}
    >
      {badge && (
        <div
          style={{
            fontFamily: f.syne,
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
            marginBottom: '4px',
          }}
        >
          {badge}
        </div>
      )}
      <div
        style={{
          fontFamily: f.syne,
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: featured ? 'var(--amber)' : 'var(--muted)',
          marginBottom: '8px',
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: f.serif,
          fontSize: '28px',
          fontWeight: 300,
          color: featured ? '#f5f0e8' : 'var(--ink)',
          lineHeight: 1,
          marginBottom: '8px',
        }}
      >
        {price}
        <span style={{ fontSize: '14px', fontWeight: 300 }}>{suffix}</span>
      </div>
      <div
        style={{
          fontFamily: f.syne,
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: featured ? 'rgba(245,240,232,0.6)' : 'var(--muted)',
        }}
      >
        {desc}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default function DiscountsPage() {
  return (
    <div style={{ paddingTop: '60px' }}>
      <div
        className="mx-auto max-w-[760px] px-5 md:px-12"
        style={{ fontFamily: 'var(--font-dm-sans)' }}
      >

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header
          className="animate-fade-up-1"
          style={{
            padding: '72px 0 48px',
            borderBottom: '1px solid var(--border)',
            marginBottom: '56px',
          }}
        >
          <div
            style={{
              fontFamily: f.syne,
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            <span style={{ width: '32px', height: '1px', background: 'var(--amber)' }} />
            Pricing · Behavioural Psychology
          </div>

          <h1
            style={{
              fontFamily: f.serif,
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
              marginBottom: '32px',
            }}
          >
            Discounts kill businesses.
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>
              Pricing psychology
            </em>{' '}
            saves them.
          </h1>

          <div
            style={{
              fontFamily: f.syne,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              display: 'flex',
              gap: '24px',
            }}
          >
            <span>May 2026</span>
            <span>6 min read</span>
          </div>
        </header>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div style={{ fontSize: '18px', lineHeight: 1.75 }}>

          {/* Why it matters */}
          <div
            style={{
              background: 'var(--ink)',
              padding: '32px 40px',
              margin: '0 0 48px',
              borderLeft: '3px solid var(--amber)',
            }}
          >
            <div
              style={{
                fontFamily: f.syne,
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--amber)',
                marginBottom: '12px',
              }}
            >
              Why it matters
            </div>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.85)',
                margin: 0,
              }}
            >
              A 1% price increase can lift operating profit by roughly 8–10% if volume
              holds. On single-digit margins, a modest discount can erase most of your
              profit. Most marketers choose the discount anyway.
            </p>
          </div>

          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            Last week a restaurant owner showed me his best month ever. Three hundred new
            customers. A 20% off promotion that "went viral locally." He was proud.
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            When we ran the numbers, that promotion had eliminated his entire profit
            margin. His competitor across the street raised prices by 2% that same month
            and made an extra $8,000.
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            Same market. Same customers. Opposite outcomes.{' '}
            <em>(Names and figures anonymised.)</em>
          </p>

          {/* ── THE MATH ───────────────────────────────────── */}
          <SectionLabel>The math</SectionLabel>

          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            Price changes flow largely to your bottom line — variable costs don't
            increase, no new hires required. On 10% margins, a 2% price increase boosts
            profits by 20%. McKinsey research puts the average operating profit lift from
            a 1% price increase at around 8–10%, assuming volume holds.
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            Lose 5% of customers in the process, and those profits can drop materially —
            around 30% under the same assumptions.
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            That gap — between 20% up and 30% down — is where pricing psychology lives.
          </p>

          {/* Visual: brutal math */}
          <VisualBlock label="The brutal math of a 2% price increase">
            <div
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ gap: '16px', marginBottom: '32px' }}
            >
              {[
                { label: 'Price increase', value: '+2%', color: 'var(--ink)' },
                {
                  label: 'Profit impact (no customer loss)',
                  value: '+20%',
                  color: '#1D9E75',
                },
              ].map(card => (
                <div
                  key={card.label}
                  style={{ background: 'var(--cream)', padding: '20px 24px' }}
                >
                  <div
                    style={{
                      fontFamily: f.syne,
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--muted)',
                      marginBottom: '6px',
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontFamily: f.serif,
                      fontSize: '48px',
                      fontWeight: 300,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: card.color,
                    }}
                  >
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            <ProfitChart />

            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginTop: '16px',
                fontFamily: f.syne,
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--muted)',
                flexWrap: 'wrap',
              }}
            >
              <span>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    display: 'inline-block',
                    marginRight: '6px',
                    background: '#1D9E75',
                  }}
                />
                Price increase, no customer loss
              </span>
              <span>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    display: 'inline-block',
                    marginRight: '6px',
                    background: '#A32D2D',
                  }}
                />
                Price increase + 5% customer loss
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                marginTop: '16px',
                fontStyle: 'italic',
              }}
            >
              Assumes 10% profit margins, flat costs, 2% price increase. The gap between
              these two outcomes is pricing psychology.
            </p>
          </VisualBlock>

          {/* ── WHY CUSTOMERS PAY MORE ─────────────────────── */}
          <SectionLabel>Why customers pay more — and don't notice</SectionLabel>

          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            They're not comparing your price to its "true value." They're comparing it to
            whatever they saw first, whatever option sits next to it, and however you've
            framed the difference.
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            That's the game. Four techniques run it.
          </p>

          {/* Visual: four techniques */}
          <VisualBlock label="Four techniques — and how they stack" noPad>
            <div
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ gap: '1px', background: 'var(--border)' }}
            >
              <TechniqueCard
                tag="Anchoring"
                tagBg="#E1F5EE"
                tagColor="#0F6E56"
                title="Show the ceiling first"
                desc="The most expensive option on your menu doesn't need to sell. It just needs to make everything else feel reasonable."
                lift="Can move transaction value — effect varies by context"
                liftColor="#0F6E56"
              />
              <TechniqueCard
                tag="Charm pricing"
                tagBg="#E6F1FB"
                tagColor="#185FA5"
                title="$890 lives in the $800s"
                desc={
                  <>
                    Research suggests prices ending in 9 can outsell round numbers
                    significantly — though effects vary by category and context. Some
                    studies suggest removing currency symbols from menus can increase
                    spend. The brain reads the left digit first — always.
                  </>
                }
                lift="Supported — Cornell/MIT research"
                liftColor="#185FA5"
              />
              <TechniqueCard
                tag="Power of three"
                tagBg="#FAEEDA"
                tagColor="#854F0B"
                title="The middle often wins"
                desc="Customers tend to avoid extremes — the middle option often becomes the default. What you show — and how much space you give it — is a pricing decision."
                lift="Directionally supported — effect varies"
                liftColor="#854F0B"
              />
              <TechniqueCard
                tag="Differential framing"
                tagBg="#FAECE7"
                tagColor="#993C1D"
                title="Show the gap, not the total"
                desc={
                  <>
                    "+40¢ for large" significantly outperforms showing the full price in
                    upgrade rate tests. "$2/day" and "$730/year" are the same number.
                    They don't feel the same.
                  </>
                }
                lift="Supported by consumer psychology research"
                liftColor="#993C1D"
              />
            </div>
          </VisualBlock>

          {/* ── ANCHORING IN PRACTICE ──────────────────────── */}
          <SectionLabel>Anchoring in practice</SectionLabel>

          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            The anchor doesn't need to sell. It just needs to exist.
          </p>

          {/* Visual: anchoring */}
          <VisualBlock label="Without the anchor — and with it">
            <div
              className="grid grid-cols-1 md:grid-cols-3"
              style={{ gap: '12px', marginBottom: '20px' }}
            >
              <TierCard name="Entry" price="$29" desc="Feels basic" />
              <TierCard
                name="Standard"
                price="$79"
                desc="Feels reasonable"
                badge="Most chosen"
                featured
              />
              <TierCard name="Premium" price="$199" desc="The anchor" />
            </div>

            <div
              style={{
                borderLeft: '3px solid var(--amber)',
                padding: '16px 20px',
                marginBottom: '20px',
                background: 'var(--cream)',
              }}
            >
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: 'var(--ink)',
                  margin: 0,
                }}
              >
                Without the $199 tier, $79 feels expensive.
              </p>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: 'var(--muted)',
                  marginTop: '4px',
                  marginBottom: 0,
                }}
              >
                With it, $79 feels like the obvious, measured choice.
              </p>
            </div>

            <div style={{ background: 'var(--cream)', padding: '20px 24px' }}>
              <div
                style={{
                  fontFamily: f.syne,
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: '14px',
                }}
              >
                Same mechanic — SaaS pricing
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-3"
                style={{ gap: '12px' }}
              >
                <SaasTierCard name="Starter" price="$25" suffix="/mo" desc="3 users" />
                <SaasTierCard
                  name="Growth"
                  price="$79"
                  suffix="/mo"
                  desc="10 users"
                  badge="Most chosen"
                  featured
                />
                <SaasTierCard
                  name="Scale"
                  price="$199"
                  suffix="/mo"
                  desc="Unlimited"
                />
              </div>
            </div>
          </VisualBlock>

          {/* ── WHY STACKING MATTERS ───────────────────────── */}
          <SectionLabel>Why stacking matters</SectionLabel>

          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            These techniques compound. Individually modest, but meaningful in combination.
            The real leverage is running them simultaneously.
          </p>

          {/* Visual: stacking */}
          <VisualBlock label="All four techniques — simultaneously" noPad>
            <div style={{ background: 'var(--cream)', padding: '32px' }}>
              <div
                style={{
                  fontFamily: f.syne,
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: '16px',
                }}
              >
                A coffee shop menu running all four techniques at once
              </div>

              <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}
              >
                {(
                  [
                    { label: 'Anchoring', bg: '#E1F5EE', color: '#0F6E56' },
                    { label: 'Charm pricing', bg: '#E6F1FB', color: '#185FA5' },
                    { label: 'Power of three', bg: '#FAEEDA', color: '#854F0B' },
                    { label: 'Differential framing', bg: '#FAECE7', color: '#993C1D' },
                  ] as const
                ).map(tag => (
                  <span
                    key={tag.label}
                    style={{
                      fontFamily: f.syne,
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 12px',
                      background: tag.bg,
                      color: tag.color,
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>

              {/* Coffee grid — always 3 cols */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1px',
                  background: 'var(--border)',
                  marginBottom: '20px',
                }}
              >
                {(
                  [
                    { size: 'Small', price: '$3.99', diff: ' ', featured: false },
                    { size: 'Medium', price: '$4.49', diff: '+50¢ from small', featured: true },
                    { size: 'Large', price: '$4.89', diff: '+40¢ from medium', featured: false },
                  ] as const
                ).map(({ size, price, diff, featured }) => (
                  <div
                    key={size}
                    style={{
                      background: featured ? 'var(--ink)' : 'var(--paper)',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: f.syne,
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: featured ? 'var(--amber)' : 'var(--muted)',
                        marginBottom: '6px',
                      }}
                    >
                      {size}
                    </div>
                    <div
                      style={{
                        fontFamily: f.serif,
                        fontSize: '28px',
                        fontWeight: 300,
                        color: featured ? 'var(--paper)' : 'var(--ink)',
                        lineHeight: 1,
                        marginBottom: '4px',
                      }}
                    >
                      {price}
                    </div>
                    <div
                      style={{
                        fontFamily: f.syne,
                        fontSize: '10px',
                        fontWeight: 600,
                        color: featured ? 'rgba(245,240,232,0.55)' : 'var(--muted)',
                      }}
                    >
                      {diff}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  Individually modest, but meaningful in combination.
                </span>
                <span
                  style={{
                    fontFamily: f.serif,
                    fontSize: '22px',
                    fontWeight: 400,
                    color: 'var(--ink)',
                  }}
                >
                  The real leverage is{' '}
                  <em style={{ color: '#0F6E56', fontStyle: 'normal' }}>
                    running them simultaneously.
                  </em>
                </span>
              </div>
            </div>
          </VisualBlock>

          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            For a business on thin margins, even modest improvements per transaction
            compound quickly — without acquiring a single new customer.
          </p>

          {/* ── WHEN THIS DOESN'T WORK ─────────────────────── */}
          <SectionLabel>When this doesn't work</SectionLabel>

          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            Behavioral pricing isn't a universal fix. These techniques perform best when
            customers are comparing options, evaluating unfamiliar prices, or making
            low-stakes decisions quickly.
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            Three situations where they lose their edge:
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            <strong style={{ fontWeight: 500 }}>Commodity markets.</strong> When buyers
            know the cost structure — procurement teams, experienced B2B buyers, repeat
            purchasers of standardized products — anchoring and charm pricing have limited
            effect. Price is price.
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            <strong style={{ fontWeight: 500 }}>High-trust relationships.</strong> A
            long-term client who knows your value doesn't need a $4.99 to feel better
            about $5. Psychological framing can actually undermine credibility with
            sophisticated buyers.
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            <strong style={{ fontWeight: 500 }}>Poorly executed anchors.</strong> An
            anchor only works if it's credible. A $1,800 iPhone exists because Apple can
            justify $1,800. An implausible anchor — a $500 product nobody would ever buy
            — signals desperation rather than premium positioning.
          </p>
          <p style={{ marginBottom: '1.6em', color: 'var(--ink)' }}>
            Test before you stack. What works in one category often fails in another.
          </p>

          {/* Pull quote */}
          <div
            style={{
              borderTop: '2px solid var(--ink)',
              borderBottom: '1px solid var(--border)',
              padding: '32px 0',
              margin: '48px 0',
            }}
          >
            <p
              style={{
                fontFamily: f.serif,
                fontSize: '28px',
                fontWeight: 300,
                lineHeight: 1.3,
                color: 'var(--ink)',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              Discounting trains customers to{' '}
              <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>wait</em>.
              Behavioral pricing trains them to{' '}
              <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>choose</em>.
            </p>
          </div>

          {/* ── THE DISCOUNT TRAP ──────────────────────────── */}
          <SectionLabel>The discount trap</SectionLabel>

          <div
            style={{
              background: 'var(--ink)',
              color: 'var(--paper)',
              padding: '40px',
              margin: '0 0 48px',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.75,
                color: 'rgba(245,240,232,0.8)',
                marginBottom: '1em',
              }}
            >
              Discounting trains customers to wait for the next deal. Every markdown is a
              signal:{' '}
              <strong style={{ color: 'var(--paper)', fontWeight: 500 }}>
                this is what we're worth when we're desperate.
              </strong>
            </p>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.75,
                color: 'rgba(245,240,232,0.8)',
                marginBottom: '1em',
              }}
            >
              Brand equity erodes slowly, then all at once.
            </p>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.75,
                color: 'rgba(245,240,232,0.8)',
                marginBottom: 0,
              }}
            >
              The restaurant owner is running another promotion next month.
            </p>
          </div>

          {/* ── BOTTOM LINE ────────────────────────────────── */}
          <div
            style={{
              borderTop: '2px solid var(--ink)',
              padding: '40px 0',
              marginTop: '56px',
            }}
          >
            <div
              style={{
                fontFamily: f.syne,
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{ width: '24px', height: '1px', background: 'var(--amber)' }}
              />
              The bottom line
            </div>
            <p
              style={{
                fontFamily: f.serif,
                fontSize: '28px',
                fontWeight: 300,
                lineHeight: 1.3,
                color: 'var(--ink)',
                marginBottom: '0.8em',
              }}
            >
              Every pricing decision is either working for your margins or against them.
            </p>
            <p
              style={{
                fontFamily: f.serif,
                fontSize: '28px',
                fontWeight: 300,
                lineHeight: 1.3,
                color: 'var(--ink)',
                marginBottom: 0,
              }}
            >
              Test one technique this week. Measure. Stack.
            </p>
          </div>

          {/* ── GO DEEPER ──────────────────────────────────── */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              padding: '32px 0 64px',
            }}
          >
            <div
              style={{
                fontFamily: f.syne,
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '16px',
              }}
            >
              Go deeper
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[
                { title: 'Predictably Irrational', author: 'Dan Ariely' },
                { title: 'The Psychology of Money', author: 'Morgan Housel' },
                { title: 'Priceless', author: 'William Poundstone' },
              ].map(book => (
                <div key={book.title} style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  <strong
                    style={{
                      color: 'var(--ink)',
                      fontWeight: 500,
                      display: 'block',
                      fontFamily: f.serif,
                      fontSize: '17px',
                    }}
                  >
                    {book.title}
                  </strong>
                  {book.author}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
