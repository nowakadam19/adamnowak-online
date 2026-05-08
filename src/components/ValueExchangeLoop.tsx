export default function ValueExchangeLoop() {
  return (
    <svg width="100%" viewBox="0 0 680 175" role="img" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '100%' }}>
      <title>Value exchange flywheel</title>
      <desc>Five-step loop: Relevance leads to Engagement, which generates Data, building Trust, driving Revenue, which funds better Relevance</desc>
      <defs>
        <marker id="arr3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
      </defs>
      <rect x="47" y="55" width="106" height="44" rx="8" fill="#5DCAA5" stroke="#0F6E56" strokeWidth="0.5"/>
      <text x="100" y="77" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#04342C">Relevance</text>
      <line x1="153" y1="77" x2="165" y2="77" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr3)"/>
      <rect x="167" y="55" width="106" height="44" rx="8" fill="#5DCAA5" stroke="#0F6E56" strokeWidth="0.5"/>
      <text x="220" y="77" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#04342C">Engagement</text>
      <line x1="273" y1="77" x2="285" y2="77" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr3)"/>
      <rect x="287" y="55" width="106" height="44" rx="8" fill="#5DCAA5" stroke="#0F6E56" strokeWidth="0.5"/>
      <text x="340" y="77" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#04342C">Data</text>
      <line x1="393" y1="77" x2="405" y2="77" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr3)"/>
      <rect x="407" y="55" width="106" height="44" rx="8" fill="#5DCAA5" stroke="#0F6E56" strokeWidth="0.5"/>
      <text x="460" y="77" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#04342C">Trust</text>
      <line x1="513" y1="77" x2="525" y2="77" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr3)"/>
      <rect x="527" y="55" width="106" height="44" rx="8" fill="#FAC775" stroke="#BA7517" strokeWidth="0.5"/>
      <text x="580" y="77" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#412402">Revenue</text>
      <path d="M580,99 L580,140 L42,140 L42,77 L47,77" fill="none" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr3)"/>
      <text x="340" y="133" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#888780">each cycle compounds</text>
    </svg>
  )
}
