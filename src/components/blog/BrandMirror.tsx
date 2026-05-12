'use client'

import { useState } from 'react'

const pairs = [
  {
    brand: 'Earn 1 point for every £1 spent.',
    customer: 'Spend £100 to get £1 back.',
    comment: 'The mechanic is the subject. The customer is doing the maths.',
  },
  {
    brand: 'Exclusive member benefits.',
    customer: 'Things you decided I'd want.',
    comment: 'Exclusivity defined by the brand rarely matches exclusivity felt by the member.',
  },
  {
    brand: 'You've been selected for our VIP tier.',
    customer: 'You noticed I spend a lot.',
    comment: 'Recognition lands when it feels personal. This one feels like a spreadsheet.',
  },
  {
    brand: 'Redeem your points for rewards.',
    customer: 'Navigate the catalogue to find something worth the effort.',
    comment: 'Redemption friction is invisible in the brief. It is very visible to the member.',
  },
  {
    brand: 'We value your loyalty.',
    customer: 'Please don't leave.',
    comment: 'The sentence was written for the brand. The member reads the subtext.',
  },
]

export default function BrandMirror() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div style={{ margin: '40px 0' }}>
      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2px',
          marginBottom: '2px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            padding: '0 0 8px 0',
          }}
        >
          Brand says
        </div>
        <div
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--green)',
            padding: '0 0 8px 16px',
          }}
        >
          Customer hears
        </div>
      </div>

      {/* Pairs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {pairs.map((pair, i) => (
          <div key={i}>
            <div
              onClick={() => setActive(active === i ? null : i)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2px',
                cursor: 'pointer',
              }}
            >
              {/* Brand cell */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: active === i ? 'var(--border)' : 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '6px 0 0 6px',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: active === i ? 'var(--muted)' : 'var(--ink)',
                  transition: 'all 0.15s',
                  fontStyle: 'italic',
                }}
              >
                {pair.brand}
              </div>

              {/* Customer cell */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: active === i ? 'var(--green)' : 'transparent',
                  border: `1px solid ${active === i ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: '0 6px 6px 0',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: active === i ? 'var(--paper)' : 'var(--ink)',
                  transition: 'all 0.15s',
                  fontStyle: 'italic',
                }}
              >
                {pair.customer}
              </div>
            </div>

            {/* Comment */}
            {active === i && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--paper)',
                  borderLeft: '2px solid var(--green)',
                  marginTop: '2px',
                  marginBottom: '4px',
                  borderRadius: '0 4px 4px 0',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'var(--ink)',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {pair.comment}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-syne)',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: 'var(--muted)',
          marginTop: '16px',
          textTransform: 'uppercase',
        }}
      >
        Click any row to see the gap.
      </p>
    </div>
  )
}
