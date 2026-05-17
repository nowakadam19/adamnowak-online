export default function FirstValueMomentDiagram() {
  return (
    <div className="my-8 overflow-x-auto">
      <svg
        width="100%"
        viewBox="0 0 680 245"
        role="img"
        aria-label="72-hour enrollment window and First Value Moment framework"
        className="min-w-[480px]"
      >
        <text
          x="122" y="42"
          textAnchor="middle"
          className="text-[11px] fill-[var(--ink)]/40 font-[Inter]"
        >
          FVM here
        </text>
        <line
          x1="122" y1="48" x2="122" y2="76"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="3 3"
          className="text-[var(--ink)]/20"
        />

        {[
          { x: 62, label: '0h' },
          { x: 249, label: '24h' },
          { x: 436, label: '48h' },
          { x: 622, label: '72h' },
        ].map(({ x, label }) => (
          <g key={label}>
            <line x1={x} y1="74" x2={x} y2="78" stroke="currentColor" strokeWidth="0.5" className="text-[var(--ink)]/30" />
            <text x={x} y="70" textAnchor="middle" className="text-[11px] fill-[var(--ink)]/40 font-[Inter]">
              {label}
            </text>
          </g>
        ))}

        {/* Green zone */}
        <rect x="62" y="78" width="187" height="24" rx="4" fill="#EAF3DE" stroke="#3B6D11" strokeWidth="0.5" />
        <text x="155" y="90" textAnchor="middle" dominantBaseline="central" className="text-[11px] fill-[#3B6D11] font-[Inter]">
          Act here
        </text>

        {/* Amber zone */}
        <rect x="249" y="78" width="187" height="24" rx="4" fill="#FAEEDA" stroke="#854F0B" strokeWidth="0.5" />
        <text x="342" y="90" textAnchor="middle" dominantBaseline="central" className="text-[11px] fill-[#854F0B] font-[Inter]">
          Fading
        </text>

        {/* Gray zone */}
        <rect x="436" y="78" width="186" height="24" rx="4" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5" />
        <text x="529" y="90" textAnchor="middle" dominantBaseline="central" className="text-[11px] fill-[#5F5E5A] font-[Inter]">
          Dormant
        </text>

        {[
          { x: 155, label: '0–24h' },
          { x: 342, label: '24–48h' },
          { x: 529, label: '48–72h' },
        ].map(({ x, label }) => (
          <text key={label} x={x} y="114" textAnchor="middle" className="text-[11px] fill-[var(--ink)]/30 font-[Inter]">
            {label}
          </text>
        ))}

        <line x1="40" y1="132" x2="640" y2="132" stroke="currentColor" strokeWidth="0.5" className="text-[var(--ink)]/10" />

        <text x="40" y="152" className="text-[11px] fill-[var(--ink)]/40 font-[Inter]">
          First Value Moment — four variables
        </text>

        {[
          { x: 40,  cx: 107, title: 'Source',    sub: 'Why they joined' },
          { x: 195, cx: 262, title: 'Barrier',   sub: 'What blocks it' },
          { x: 350, cx: 417, title: 'Stimulus',  sub: 'The trigger' },
          { x: 505, cx: 572, title: 'Threshold', sub: 'Right intensity' },
        ].map(({ x, cx, title, sub }, i) => (
          <g key={title}>
            <rect x={x} y="165" width="135" height="52" rx="8"
              fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5" />
            <text x={cx} y="184" textAnchor="middle" dominantBaseline="central"
              className="text-[13px] font-medium fill-[#085041] font-[Inter]">
              {title}
            </text>
            <text x={cx} y="201" textAnchor="middle" dominantBaseline="central"
              className="text-[11px] fill-[#0F6E56] font-[Inter]">
              {sub}
            </text>
            {i < 3 && (
              <line
                x1={x + 136} y1="191" x2={x + 153} y2="191"
                stroke="#0F6E56" strokeWidth="1"
                markerEnd="url(#fvm-arrow)"
              />
            )}
          </g>
        ))}

        <defs>
          <marker id="fvm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}
