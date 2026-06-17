import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Adam Nowak",
  description:
    "How adamnowak.online handles your data, cookies, and your rights under GDPR.",
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
      <article className="prose prose-neutral max-w-none">
        <h1>Privacy Policy</h1>
        <p>
          <strong>Last updated: 17 June 2026</strong>
        </p>

        <p>
          This policy explains how this website handles your data, what cookies
          it uses, and what rights you have under the EU General Data Protection
          Regulation (GDPR). It applies to adamnowak.online and any pages or
          tools hosted on this domain.
        </p>

        <h2>1. Who we are</h2>
        <p>
          This site is operated by Adam Nowak, an individual based in Warsaw,
          Poland. It is a personal professional site and not a commercial
          entity. The data controller under GDPR is Adam Nowak.
        </p>
        <p>
          <strong>Contact for privacy matters:</strong>{" "}
          <a href="mailto:privacy@adamnowak.online">
            privacy@adamnowak.online
          </a>
        </p>

        <h2>2. What data we collect</h2>
        <p>
          We collect only what we need for the site to work and what you choose
          to share.
        </p>
        <ul>
          <li>
            <strong>Forms.</strong> When you send a message through the contact
            form or submit feedback on the Loyalty ROI Calculator, we receive
            the email address and the text you provide.
          </li>
          <li>
            <strong>Hosting logs.</strong> Vercel, our hosting provider,
            automatically logs basic technical data — your IP address, browser
            user-agent string, request timestamps, and page paths. This is used
            for security, performance, and abuse prevention.
          </li>
          <li>
            <strong>Cookie preference.</strong> Your consent choice from the
            cookie banner is stored in your browser&apos;s localStorage so we
            don&apos;t ask again on every visit.
          </li>
          <li>
            <strong>Tag management.</strong> Google Tag Manager is loaded on
            every page. By itself it does not collect personal data — it is a
            container for other tags. No analytics, advertising, or remarketing
            tags are active until you give consent.
          </li>
        </ul>
        <p>
          We do not knowingly collect any special categories of personal data
          (health, religion, political views, etc.).
        </p>

        <h2>3. Legal basis (GDPR Art. 6)</h2>
        <ul>
          <li>
            <strong>Consent</strong> — for analytics and marketing cookies. You
            can withdraw consent at any time via the &quot;Manage cookies&quot;
            link in the footer.
          </li>
          <li>
            <strong>Performance of a contract / pre-contractual steps</strong>{" "}
            — for inquiries you send via the contact form.
          </li>
          <li>
            <strong>Legitimate interest</strong> — for hosting logs (security,
            abuse prevention, troubleshooting). You can object at
            privacy@adamnowak.online.
          </li>
        </ul>

        <h2>4. Cookies</h2>
        <p>Cookies on this site fall into three categories:</p>
        <ul>
          <li>
            <strong>Essential.</strong> Required for the site to function.
            Currently: the cookie consent preference (localStorage). Always
            active, no consent needed.
          </li>
          <li>
            <strong>Analytics.</strong> Measure how visitors use the site.
            Currently: none active. When Google Analytics 4 is added in the
            future, this policy will be updated and the banner will continue to
            require your consent.
          </li>
          <li>
            <strong>Marketing.</strong> Used for advertising and remarketing.
            Currently: none active. When Google Ads remarketing is added in the
            future, this policy will be updated.
          </li>
        </ul>
        <p>
          Your choice via the cookie banner controls whether analytics and
          marketing cookies are allowed to be set. You can change your mind at
          any time using the &quot;Manage cookies&quot; link in the footer.
        </p>

        <h2>5. Third parties</h2>
        <p>
          The following services process data on our behalf or as joint
          controllers:
        </p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> (USA) — hosting and CDN.
          </li>
          <li>
            <strong>Resend, Inc.</strong> (USA) — transactional email delivery
            for the contact form and feedback submissions.
          </li>
          <li>
            <strong>Cloudflare, Inc.</strong> (USA) — DNS and email routing
            infrastructure.
          </li>
          <li>
            <strong>Google LLC</strong> (USA) — Google Tag Manager. Future
            additions (GA4, Google Ads) will appear here when activated.
          </li>
        </ul>
        <p>
          All four are signatories of the EU–U.S. Data Privacy Framework, which
          provides an adequacy mechanism for transfers from the EU to the U.S.
          Where the Framework does not apply, transfers rely on Standard
          Contractual Clauses.
        </p>

        <h2>6. International transfers</h2>
        <p>
          Personal data may be transferred to the United States via the services
          listed above. We rely on the EU–U.S. Data Privacy Framework and
          Standard Contractual Clauses for these transfers.
        </p>

        <h2>7. Retention</h2>
        <ul>
          <li>
            <strong>Contact form messages and feedback:</strong> kept for up to
            3 years from the date of resolution, then deleted.
          </li>
          <li>
            <strong>Hosting logs:</strong> retained by Vercel per their data
            processing policy, typically 30–90 days.
          </li>
          <li>
            <strong>Cookie consent preference:</strong> kept in your browser
            until you clear it.
          </li>
        </ul>

        <h2>8. Your rights under GDPR</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> your data (Art. 15)</li>
          <li><strong>Rectify</strong> inaccurate data (Art. 16)</li>
          <li><strong>Erase</strong> your data (Art. 17)</li>
          <li><strong>Restrict</strong> processing (Art. 18)</li>
          <li><strong>Data portability</strong> (Art. 20)</li>
          <li>
            <strong>Object</strong> to processing based on legitimate interest
            (Art. 21)
          </li>
          <li><strong>Withdraw consent</strong> at any time (Art. 7(3))</li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a href="mailto:privacy@adamnowak.online">
            privacy@adamnowak.online
          </a>
          . We will respond within 30 days.
        </p>

        <h2>9. Complaints</h2>
        <p>
          If you believe we have processed your data unlawfully, you may file a
          complaint with the Polish supervisory authority:
        </p>
        <p>
          <strong>Urząd Ochrony Danych Osobowych (UODO)</strong>
          <br />
          ul. Stawki 2, 00-193 Warszawa
          <br />
          <a
            href="https://uodo.gov.pl"
            target="_blank"
            rel="noopener noreferrer"
          >
            uodo.gov.pl
          </a>
        </p>

        <h2>10. Children</h2>
        <p>
          This site is not directed at children under 16. We do not knowingly
          collect personal data from children.
        </p>

        <h2>11. Changes to this policy</h2>
        <p>
          We update this policy when our data practices change. Material changes
          will be announced via the cookie banner on your next visit. The
          &quot;Last updated&quot; date at the top reflects the most recent
          revision.
        </p>

        <hr />
        <p>
          If anything here is unclear, write to{" "}
          <a href="mailto:privacy@adamnowak.online">
            privacy@adamnowak.online
          </a>{" "}
          and we&apos;ll explain.
        </p>
      </article>
    </main>
  )
}
