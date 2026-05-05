'use client'

import { useEffect, useRef } from 'react'

export default function ProfitChart() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let chart: import('chart.js').Chart | undefined

    async function init() {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
      if (!ref.current) return

      chart = new Chart(ref.current, {
        type: 'bar',
        data: {
          labels: [
            '2% price increase\n(no customer loss)',
            '2% price increase\n+ 5% customer loss',
          ],
          datasets: [
            {
              data: [20, -31],
              backgroundColor: ['#1D9E75', '#A32D2D'],
              borderRadius: 2,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx =>
                  ((ctx.raw as number) > 0 ? '+' : '') + ctx.raw + '% profit',
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'DM Sans', size: 12 }, color: '#6b6558' },
            },
            y: {
              min: -50,
              max: 35,
              grid: { color: 'rgba(107,101,88,0.15)' },
              ticks: {
                font: { family: 'DM Sans', size: 12 },
                color: '#6b6558',
                callback: v => (Number(v) > 0 ? '+' : '') + v + '%',
              },
            },
          },
        },
      })
    }

    init()
    return () => chart?.destroy()
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '240px' }}>
      <canvas
        ref={ref}
        role="img"
        aria-label="Bar chart: +20% profit with price increase alone, -31% profit if 5% of customers are lost"
      />
    </div>
  )
}
