export default function PersonalizationLoop() {
  return (
    <svg width="100%" viewBox="0 0 680 415" role="img" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '100%' }}>
      <title>Personalization loop diagram</title>
      <desc>Two flows: intact personalization loop vs loop broken by human override</desc>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
      </defs>

      {/* Panel titles */}
      <text x="175" y="36" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0A0A08">Loop intact</text>
      <text x="505" y="36" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0A0A08">Override breaks it</text>

      {/* Divider */}
      <line x1="340" y1="50" x2="340" y2="380" stroke="#0A0A08" strokeWidth="1" strokeOpacity="0.12" strokeDasharray="4 4"/>

      {/* ── LEFT PANEL ── */}
      {/* Box 1 */}
      <rect x="75" y="55" width="200" height="44" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
      <text x="175" y="77" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#085041">Customer behavior</text>
      <line x1="175" y1="99" x2="175" y2="119" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr)"/>

      {/* Box 2 */}
      <rect x="75" y="119" width="200" height="44" rx="8" fill="#5DCAA5" stroke="#0F6E56" strokeWidth="0.5"/>
      <text x="175" y="141" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#04342C">Algorithm</text>
      <line x1="175" y1="163" x2="175" y2="183" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr)"/>

      {/* Box 3 */}
      <rect x="75" y="183" width="200" height="44" rx="8" fill="#5DCAA5" stroke="#0F6E56" strokeWidth="0.5"/>
      <text x="175" y="205" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#04342C">Recommendation</text>
      <line x1="175" y1="227" x2="175" y2="247" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr)"/>

      {/* Box 4 */}
      <rect x="75" y="247" width="200" height="56" rx="8" fill="#5DCAA5" stroke="#0F6E56" strokeWidth="0.5"/>
      <text x="175" y="268" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#04342C">Conversion</text>
      <text x="175" y="288" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#085041">Data feeds back to algorithm</text>

      {/* Return arrow */}
      <path d="M175,303 L175,322 L48,322 L48,77 L75,77" fill="none" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#arr)"/>
      <text x="30" y="200" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#0F6E56" transform="rotate(-90,30,200)">signal improves</text>

      {/* ── RIGHT PANEL ── */}
      {/* Box 1 */}
      <rect x="405" y="55" width="200" height="44" rx="8" fill="#F1EFE8" stroke="#888780" strokeWidth="0.5"/>
      <text x="505" y="77" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#2C2C2A">Customer behavior</text>
      <line x1="505" y1="99" x2="505" y2="119" stroke="#888780" strokeWidth="1.5" markerEnd="url(#arr)"/>

      {/* Box 2 */}
      <rect x="405" y="119" width="200" height="44" rx="8" fill="#D3D1C7" stroke="#888780" strokeWidth="0.5"/>
      <text x="505" y="141" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#2C2C2A">Algorithm</text>
      <line x1="505" y1="163" x2="505" y2="183" stroke="#A32D2D" strokeWidth="1.5" markerEnd="url(#arr)"/>

      {/* Override box */}
      <rect x="405" y="183" width="200" height="56" rx="8" fill="#F7C1C1" stroke="#A32D2D" strokeWidth="0.5"/>
      <text x="505" y="204" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#501313">Override</text>
      <text x="505" y="224" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#791F1F">Margin &gt; customer fit</text>
      <line x1="505" y1="239" x2="505" y2="259" stroke="#A32D2D" strokeWidth="1.5" markerEnd="url(#arr)"/>

      {/* Suboptimal box */}
      <rect x="405" y="259" width="200" height="56" rx="8" fill="#F5C4B3" stroke="#993C1D" strokeWidth="0.5"/>
      <text x="505" y="280" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#4A1B0C">Suboptimal result</text>
      <text x="505" y="300" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#712B13">Corrupts the signal</text>

      {/* Broken return */}
      <path d="M505,315 L505,338 L632,338" fill="none" stroke="#B4B2A9" strokeWidth="1.5" strokeDasharray="5 4"/>
      <text x="652" y="200" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#888780" transform="rotate(90,652,200)">loop broken</text>
    </svg>
  )
}
