import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Adam Nowak'
  const truncated = title.length > 80 ? title.slice(0, 77) + '…' : title

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#0A0A08',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
        }}
      >
        {/* Top label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontFamily: 'serif',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4CAF7D',
            }}
          >
            CUSTOMER LOYALTY INTELLIGENCE
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: 'serif',
            fontSize: truncated.length > 60 ? '52px' : '64px',
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 1.15,
            color: '#FAFAF8',
            maxWidth: '900px',
          }}
        >
          {truncated}
        </div>

        {/* Bottom — author + site */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#FAFAF8',
              opacity: 0.7,
            }}
          >
            Adam Nowak
          </div>
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: '16px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#4CAF7D',
              opacity: 0.9,
            }}
          >
            adamnowak.online
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
