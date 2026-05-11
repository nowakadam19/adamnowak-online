'use client'

import { useState } from 'react'

const questions = [
  'Your points never expire — because customers complained when they did.',
  'Your top tier has members who qualified once, years ago, and have never been downgraded.',
  'Your cashback rate increased after a competitor launched theirs.',
  'Your program added a benefit primarily because a key account requested it.',
  'You can name the complaint that created at least one of your current mechanics.',
  'Your last program change was described internally as a retention decision.',
]

function getDiagnosis(count: number): string {
  if (count === 0) return 'Your program has a vision. Guard it.'
  if (count <= 2) return 'Some mechanics have drifted. Worth a review.'
  if (count <= 4) return 'Your complaints department has significant influence.'
  return 'Your program was built by your complaints department.'
}

export default function ReactiveVisionaryChecklist() {
  const [checked, setChecked] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  )

  const toggle = (i: number) => {
    setChecked(prev => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  const count = checked.filter(Boolean).length
  const diagnosis = getDiagnosis(count)

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '32px',
        margin: '40px 0',
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
          marginBottom: '24px',
        }}
      >
        Reactive Program Diagnostic
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {questions.map((q, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              cursor: 'pointer',
            }}
          >
            {/* Checkbox */}
            <div
              style={{
                width: '22px',
                height: '22px',
                minWidth: '22px',
                borderRadius: '4px',
                border: checked[i]
                  ? '2px solid var(--green)'
                  : '2px solid var(--border)',
                backgroundColor: checked[i] ? 'var(--green)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px',
                transition: 'all 0.15s',
              }}
            >
              {checked[i] && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path
                    d="M1 4L4.5 7.5L11 1"
                    stroke="var(--paper)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            {/* Question text */}
            <span
              style={{
                fontSize: '16px',
                lineHeight: 1.65,
                color: checked[i] ? 'var(--muted)' : 'var(--ink)',
                transition: 'color 0.15s',
                userSelect: 'none',
              }}
            >
              {q}
            </span>
          </div>
        ))}
      </div>

      {/* Result */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'baseline',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '42px',
            fontWeight: 400,
            color: count >= 4 ? 'var(--ink)' : 'var(--green)',
            lineHeight: 1,
            transition: 'color 0.2s',
          }}
        >
          {count}/6
        </span>
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '20px',
            fontStyle: 'italic',
            color: 'var(--ink)',
            lineHeight: 1.4,
          }}
        >
          {diagnosis}
        </span>
      </div>
    </div>
  )
}
