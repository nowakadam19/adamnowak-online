export default function BrandPersonalityMatrix() {
  return (
    <div className="my-8 flex justify-center">
      <svg viewBox="0 0 640 480" width="640" height="480" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '100%' }}>
        <rect width="640" height="480" fill="#FAFAF8"/>
        <rect x="80" y="40" width="240" height="200" fill="#1E4530" opacity="0.08"/>
        <rect x="320" y="40" width="240" height="200" fill="#1E4530" opacity="0.18"/>
        <rect x="80" y="240" width="240" height="200" fill="#0A0A08" opacity="0.04"/>
        <rect x="320" y="240" width="240" height="200" fill="#c0392b" opacity="0.08"/>
        <line x1="80" y1="240" x2="560" y2="240" stroke="#0A0A08" strokeWidth="1.5" strokeDasharray="4,4"/>
        <line x1="320" y1="40" x2="320" y2="440" stroke="#0A0A08" strokeWidth="1.5" strokeDasharray="4,4"/>
        <line x1="80" y1="440" x2="560" y2="440" stroke="#0A0A08" strokeWidth="2"/>
        <line x1="80" y1="40" x2="80" y2="440" stroke="#0A0A08" strokeWidth="2"/>
        <polygon points="560,436 568,440 560,444" fill="#0A0A08"/>
        <polygon points="76,40 80,32 84,40" fill="#0A0A08"/>
        <text x="320" y="468" textAnchor="middle" fontSize="12" fill="#0A0A08" fontWeight="600" letterSpacing="0.05em">PERSONALITY INTENSITY</text>
        <text x="100" y="468" textAnchor="start" fontSize="10" fill="#0A0A08" opacity="0.5">LOW</text>
        <text x="540" y="468" textAnchor="end" fontSize="10" fill="#0A0A08" opacity="0.5">HIGH</text>
        <text x="20" y="240" textAnchor="middle" fontSize="12" fill="#0A0A08" fontWeight="600" letterSpacing="0.05em" transform="rotate(-90, 20, 240)">FUNCTIONAL FIT</text>
        <text x="28" y="435" textAnchor="middle" fontSize="10" fill="#0A0A08" opacity="0.5">LOW</text>
        <text x="28" y="55" textAnchor="middle" fontSize="10" fill="#0A0A08" opacity="0.5">HIGH</text>
        <text x="200" y="72" textAnchor="middle" fontSize="11" fill="#1E4530" fontWeight="700" letterSpacing="0.08em">PROFESSIONALLY EXCELLENT</text>
        <text x="440" y="72" textAnchor="middle" fontSize="11" fill="#1E4530" fontWeight="700" letterSpacing="0.08em">AUTHENTIC</text>
        <text x="200" y="272" textAnchor="middle" fontSize="11" fill="#0A0A08" fontWeight="700" letterSpacing="0.08em" opacity="0.35">INVISIBLE</text>
        <text x="440" y="272" textAnchor="middle" fontSize="11" fill="#c0392b" fontWeight="700" letterSpacing="0.08em">FORCED INTIMACY</text>
        <circle cx="160" cy="140" r="6" fill="#1E4530"/>
        <text x="172" y="136" fontSize="12" fill="#0A0A08" fontWeight="600">Maersk</text>
        <text x="172" y="150" fontSize="10" fill="#0A0A08" opacity="0.6">Expert voice, low volume</text>
        <circle cx="200" cy="185" r="6" fill="#1E4530"/>
        <text x="212" y="181" fontSize="12" fill="#0A0A08" fontWeight="600">ING Bank</text>
        <text x="212" y="195" fontSize="10" fill="#0A0A08" opacity="0.6">Clarity over connection</text>
        <circle cx="390" cy="110" r="6" fill="#1E4530"/>
        <text x="402" y="106" fontSize="12" fill="#0A0A08" fontWeight="600">Duolingo</text>
        <text x="402" y="120" fontSize="10" fill="#0A0A08" opacity="0.6">Guilt serves habit formation</text>
        <circle cx="420" cy="165" r="6" fill="#1E4530"/>
        <text x="432" y="161" fontSize="12" fill="#0A0A08" fontWeight="600">Ryanair</text>
        <text x="432" y="175" fontSize="10" fill="#0A0A08" opacity="0.6">Sarcasm = no-frills promise</text>
        <circle cx="390" cy="360" r="6" fill="#c0392b"/>
        <text x="402" y="356" fontSize="12" fill="#0A0A08" fontWeight="600">Electricity provider</text>
        <text x="402" y="370" fontSize="10" fill="#0A0A08" opacity="0.6">&quot;We miss you 😢&quot;</text>
        <rect x="80" y="40" width="480" height="400" fill="none" stroke="#0A0A08" strokeWidth="1.5" opacity="0.15"/>
      </svg>
    </div>
  )
}
