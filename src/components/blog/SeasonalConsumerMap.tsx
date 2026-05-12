'use client'

import { useState } from 'react'

const seasons = [
  {
    name: 'Spring',
    months: 'Mar — May',
    activities: [
      'Spring cleaning and home reorganisation',
      'Seasonal home redecoration',
      'Easter celebrations and family gatherings',
      'Return to outdoor activities',
      'Diet reset and lighter eating',
    ],
    pains: [
      'Home feels heavy after winter — need to reclaim it',
      'Seasonal transition creates decision fatigue (what to keep, store, change)',
      'Motivation is high but time is short',
    ],
    crm: 'Arrive with simplicity. Spring is about starting fresh — your message should feel like the first warm day, not another task.',
  },
  {
    name: 'Summer',
    months: 'Jun — Aug',
    activities: [
      'Holiday planning and travel',
      'Outdoor eating — balconies, BBQ, picnics',
      'Home renovation and repair',
      'Family reunions and guests visiting',
      "Children's summer holidays",
    ],
    pains: [
      'High activity, low attention — everything competes',
      'Away from home means away from routine',
      'Renovation decisions are high-stakes and anxiety-prone',
    ],
    crm: 'Summer is not a peak moment for most categories — it is a maintenance window. Keep sends light. Segment for those staying home vs. travelling.',
  },
  {
    name: 'Autumn',
    months: 'Sep — Nov',
    activities: [
      'Back to school and new routines',
      'Preserving and seasonal food preparation',
      'Spending more time at home',
      'Seasonal clothing storage change',
      'New hobbies and courses starting',
    ],
    pains: [
      'Return from summer creates a reset instinct — people want to organise',
      'Shorter days increase nesting behaviour',
      'New-start energy in September is high but fades quickly',
    ],
    crm: 'September is the second January. New-start messaging lands here better than it does in January — less noise, same instinct. Act early.',
  },
  {
    name: 'Winter',
    months: 'Dec — Feb',
    activities: [
      'Christmas preparation — gifts, food, decoration',
      'Family gatherings and hosting',
      "New Year's resolutions and planning",
      'Increased time at home — books, TV, board games',
      "Valentine's Day",
    ],
    pains: [
      'Decision overload during gifting season',
      'Resolution fatigue in January — ambition meets friction',
      'Cold and darkness create comfort-seeking behaviour',
    ],
    crm: 'December is the loudest inbox month of the year. Stand out by being useful, not promotional. January is under-used — members are in planning mode and receptive.',
  },
]

export default function SeasonalConsumerMap() {
  const [active, setActive] = useState<number>(0)

  const season = seasons[active]

  return (
    <div style={{ margin: '40px 0' }}>
      {/* Season tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          marginBottom: '2px',
        }}
      >
        {seasons.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setActive(i)}
            style={{
              padding: '12px 8px',
              border: `1px solid ${active === i ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: '6px',
              backgroundColor: active === i ? 'var(--green)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: active === i ? 'var(--paper)' : 'var(--ink)',
                marginBottom: '2px',
              }}
            >
              {s.name}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '9px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: active === i ? 'rgba(239,239,235,0.7)' : 'var(--muted)',
              }}
            >
              {s.months}
            </div>
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div
        style={{
          border: '1px solid var(--green)',
          borderRadius: '0 0 8px 8px',
          padding: '28px',
          borderTop: 'none',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '24px',
          }}
          className="flex flex-col md:grid"
        >
          {/* Activities */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--green)',
                marginBottom: '12px',
              }}
            >
              Consumer activities
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {season.activities.map((a, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: 'var(--ink)',
                    paddingBottom: '6px',
                    paddingLeft: '12px',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      color: 'var(--green)',
                    }}
                  >
                    —
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Pains */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '12px',
              }}
            >
              Key pains
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {season.pains.map((p, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: 'var(--ink)',
                    paddingBottom: '6px',
                    paddingLeft: '12px',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      color: 'var(--muted)',
                    }}
                  >
                    —
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CRM angle */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '20px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--green)',
              marginBottom: '8px',
            }}
          >
            CRM angle
          </p>
          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--ink)',
              fontStyle: 'italic',
              fontFamily: 'var(--font-cormorant)',
              margin: 0,
            }}
          >
            {season.crm}
          </p>
        </div>
      </div>
    </div>
  )
}
