export default function ExperienceGrowthLayers() {
  return (
    <svg width="100%" viewBox="0 0 680 175" role="img" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '100%' }}>
      <title>Experience-driven growth layers</title>
      <desc>Three-layer growth framework: Acquisition feeds Experience, which enables Intelligence, which compounds back into Acquisition</desc>
      <defs>
        <marker id="arr4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
      </defs>
      <rect x="55" y="45" width="170" height="56" rx="8" fill="#D3D1C7" stroke="#888780" strokeWidth="0.5"/>
      <text x="140" y="66" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="600" fill="#2C2C2A">Acquisition</text>
      <text x="140" y="86" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">Traditional marketing</text>
      <line x1="225" y1="73" x2="253" y2="73" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr4)"/>
      <rect x="255" y="45" width="170" height="56" rx="8" fill="#5DCAA5" stroke="#0F6E56" strokeWidth="0.5"/>
      <text x="340" y="66" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="600" fill="#04342C">Experience</text>
      <text x="340" y="86" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">What makes customers return</text>
      <line x1="425" y1="73" x2="453" y2="73" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr4)"/>
      <rect x="455" y="45" width="170" height="56" rx="8" fill="#FAC775" stroke="#BA7517" strokeWidth="0.5"/>
      <text x="540" y="66" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="600" fill="#412402">Intelligence</text>
      <text x="540" y="86" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#633806">Data connecting to behavior</text>
      <path d="M540,101 L540,135 L42,135 L42,73 L55,73" fill="none" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr4)"/>
      <text x="340" y="128" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#888780">compound effect</text>
    </svg>
  )
}
