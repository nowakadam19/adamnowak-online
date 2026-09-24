import type { Metadata } from "next"
import { TierPlanner } from "@/components/tools/TierPlanner"

const TITLE = "Loyalty Tier Planner"
const DESCRIPTION = "Where to set tier thresholds and how many tiers you need, tested on your own customer distribution. Free, no registration, nothing leaves your browser."
const URL = "https://www.adamnowak.online/tools/loyalty-tier-planner"

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent(TITLE)}`, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`/api/og?title=${encodeURIComponent(TITLE)}`],
  },
  alternates: { canonical: URL },
}

export default function TierPlannerPage() {
  return (
    <main className="min-h-screen pt-[60px]" style={{ background: "#EFEFEB" }}>
      <div className="border-b px-5 py-10" style={{ borderColor: "rgba(10,10,8,0.12)", background: "#fff" }}>
        <p className="text-[11px] tracking-[0.14em] uppercase mb-1" style={{ color: "#6b6b68", fontFamily: "Syne, sans-serif" }}>
          Tools · adamnowak.online
        </p>
        <h1 className="leading-tight mb-2" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#0A0A08" }}>
          Loyalty <span style={{ color: "#4CAF7D" }}>Tier Planner</span>
        </h1>
        <p className="text-[14px] leading-relaxed max-w-2xl" style={{ color: "#6b6b68" }}>{DESCRIPTION}</p>
      </div>
      <div className="max-w-6xl mx-auto mt-6">
        <TierPlanner />
      </div>
      <div className="px-5 py-4 text-center text-[11px]" style={{ color: "#6b6b68", fontFamily: "Syne, sans-serif", borderTop: "1px solid rgba(10,10,8,0.08)" }}>
        Built by <a href="https://www.adamnowak.online" className="underline" style={{ color: "#1E4530" }}>Adam Nowak</a> · No data is stored or tracked · All calculations run in your browser
      </div>
    </main>
  )
}
