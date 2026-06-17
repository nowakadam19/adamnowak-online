import type { Metadata } from 'next'
import { Cormorant_Garamond, Syne, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from "next/script"
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieConsent from "@/components/CookieConsent"
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
  metadataBase: new URL('https://www.adamnowak.online'),
  alternates: { canonical: 'https://www.adamnowak.online' },
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
    url: 'https://www.adamnowak.online',
    title: 'Adam Nowak — Customer Loyalty & CRM Intelligence',
    description: 'Customer loyalty is full of noise. This is the signal.',
    siteName: 'Adam Nowak',
    locale: 'en_GB',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'adamnowak.online — Customer loyalty intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adam Nowak — Customer Loyalty & CRM Intelligence',
    description: 'Customer loyalty is full of noise. This is the signal.',
    images: ['/og-default.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://www.adamnowak.online/#person',
        name: 'Adam Nowak',
        url: 'https://www.adamnowak.online',
        image: 'https://www.adamnowak.online/adam-nowak.jpg',
        jobTitle: 'Customer Marketing & Loyalty Director, EMEA',
        description:
          'Customer loyalty and CRM practitioner. 20+ years in customer marketing, 15+ specifically in loyalty across EMEA, NAM and APAC. Loyalty programs at IKEA, Electrolux, and Avis Budget Group International.',
        worksFor: {
          '@type': 'Organization',
          name: 'Avis Budget Group International',
          url: 'https://www.avisbudgetgroup.com',
        },
        alumniOf: [
          {
            '@type': 'Organization',
            name: 'IKEA',
            url: 'https://www.ikea.com',
          },
          {
            '@type': 'Organization',
            name: 'Electrolux',
            url: 'https://www.electroluxgroup.com',
          },
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Warsaw',
          addressCountry: 'PL',
        },
        knowsAbout: [
          'Customer Loyalty',
          'Loyalty Program Strategy',
          'CRM Strategy',
          'Customer Engagement',
          'Lifecycle Marketing',
          'Behavioural Economics',
          'Customer Lifetime Value',
          'Retention Marketing',
          'Net Promoter Score',
          'Customer Data Platforms',
          'Multi-market Loyalty Programs',
          'EMEA Markets',
        ],
        sameAs: ['https://www.linkedin.com/in/adam-nowak'],
      },
    {
      '@type': 'WebSite',
      '@id': 'https://www.adamnowak.online/#website',
      url: 'https://www.adamnowak.online',
      name: 'Adam Nowak — Customer Loyalty Intelligence',
      description: 'Practical thinking on customer loyalty, CRM and retention marketing.',
      inLanguage: 'en',
    },
    {
      '@type': 'Blog',
      '@id': 'https://www.adamnowak.online/blog',
      name: 'Blog — Adam Nowak',
      description: 'Articles on customer loyalty, CRM, pricing psychology and behavioural marketing.',
      url: 'https://www.adamnowak.online/blog',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${syne.variable} ${inter.variable}`}
    >
      <head>
        <Script id="gtag-consent-default" strategy="beforeInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted',
      wait_for_update: 500
    });
    gtag('set', 'ads_data_redaction', true);
  `}
        </Script>
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script id="gtm-base" strategy="afterInteractive">
            {`
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
    `}
          </Script>
        )}
      </head>
      <body className="flex min-h-screen flex-col">
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  )
}
