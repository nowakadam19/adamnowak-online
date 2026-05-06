import type { Metadata } from 'next'
import { Cormorant_Garamond, Syne, Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

const cormorant = Cormorant_Garamond({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Adam Nowak — Customer Loyalty & CRM Intelligence',
    template: '%s | Adam Nowak',
  },
  description:
    'Practical thinking on customer loyalty, CRM and retention marketing — clear frameworks, honest takes, and actionable ideas from 15+ years across EMEA, NAM and APAC.',
  metadataBase: new URL('https://adamnowak.online'),
  alternates: { canonical: 'https://adamnowak.online' },
  robots: { index: true, follow: true },
  keywords: [
    'customer loyalty',
    'CRM strategy',
    'retention marketing',
    'loyalty programme',
    'customer marketing',
    'behavioural economics',
    'customer lifetime value',
    'NPS',
  ],
  openGraph: {
    type: 'website',
    url: 'https://adamnowak.online',
    title: 'Adam Nowak — Customer Loyalty & CRM Intelligence',
    description: 'Customer loyalty is full of noise. This is the signal.',
    siteName: 'Adam Nowak',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adam Nowak — Customer Loyalty & CRM Intelligence',
    description: 'Customer loyalty is full of noise. This is the signal.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://adamnowak.online/#person',
      name: 'Adam Nowak',
      url: 'https://adamnowak.online',
      jobTitle: 'Customer Marketing Strategist',
      description:
        'Senior CRM and loyalty strategy professional with 15+ years of experience across EMEA, NAM and APAC. Creator of the Customer Marketing Blueprint.',
      knowsAbout: [
        'Customer Loyalty',
        'CRM Strategy',
        'Retention Marketing',
        'Behavioural Psychology',
        'Customer Lifetime Value',
        'Loyalty Programmes',
        'Net Promoter Score',
        'Customer Data Platforms',
      ],
      sameAs: ['https://www.linkedin.com/in/adamnowak'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://adamnowak.online/#website',
      url: 'https://adamnowak.online',
      name: 'Adam Nowak — Customer Loyalty Intelligence',
      description: 'Practical thinking on customer loyalty, CRM and retention marketing.',
      inLanguage: 'en',
    },
    {
      '@type': 'Blog',
      '@id': 'https://adamnowak.online/blog',
      name: 'Blog — Adam Nowak',
      description: 'Articles on customer loyalty, CRM, pricing psychology and behavioural marketing.',
      url: 'https://adamnowak.online/blog',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${syne.variable} ${inter.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
