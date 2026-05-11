import type { Metadata } from 'next'
import AboutClient from './AboutClient'

const SITE_URL = 'https://www.adamnowak.online'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Customer loyalty and CRM strategist. 15+ years building programs across EMEA — IKEA FAMILY, Electrolux, Avis Budget Group International.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About | Adam Nowak',
    description:
      'Customer loyalty and CRM strategist. 15+ years building programs across EMEA — IKEA FAMILY, Electrolux, Avis Budget Group International.',
    url: `${SITE_URL}/about`,
    type: 'profile',
    images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630, alt: 'Adam Nowak' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Adam Nowak',
    description:
      'Customer loyalty and CRM strategist. 15+ years building programs across EMEA — IKEA FAMILY, Electrolux, Avis Budget Group International.',
    images: [`${SITE_URL}/og-default.png`],
  },
}

export default function AboutPage() {
  return <AboutClient />
}
