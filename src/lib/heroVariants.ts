// Single source of truth for the rotating hero headline. Kept in a plain module
// (no 'use client') so both the server component that picks the daily variant
// (src/app/page.tsx) and the client component that renders it (HomeClient) import
// the same real array — importing data out of a 'use client' module would only
// hand the server a client-reference stub.
//
// Each H1 is split so the `accent` fragment renders in serif italic --green while
// the rest stays --ink. Adding a fourth variant is a one-line change to this array;
// the date rotation adapts to the new length automatically.
export interface HeroVariant {
  before: string
  accent: string
  after: string
  lead: string
}

export const HERO_VARIANTS: HeroVariant[] = [
  {
    before: 'Twenty years taught me where ',
    accent: 'customer loyalty breaks',
    after: ". New tools mean it doesn't have to.",
    lead: 'Writing on loyalty, CRM and customer marketing — plus the tools I build along the way.',
  },
  {
    before: 'Most of what customer teams want ',
    accent: "isn't impossible",
    after: ". It's just unbuilt.",
    lead: 'Writing and working tools on loyalty, CRM and customer marketing — for people who want it built, not debated.',
  },
  {
    before: 'Every loyalty problem breaks down into ',
    accent: 'time, money and decisions',
    after: '. I write about telling them apart.',
    lead: 'Loyalty, CRM and customer marketing — for practitioners who want clarity, not complexity.',
  },
]
