import { useEffect, useRef } from 'react';

// Termly cookie policy constants – separates markup container and script data.
const TERMLY_POLICY_CONTAINER_NAME = 'termly-embed';
const TERMLY_POLICY_CONTAINER_DATA_ID = '0268aa58-1600-48d8-9ca2-f2577e56a881';
const TERMLY_POLICY_SCRIPT_ID = 'termly-jssdk';
const TERMLY_POLICY_SCRIPT_SRC = 'https://app.termly.io/embed-policy.min.js';

/**
 * CookiePolicy
 *
 * Renders the Termly cookie policy embed at `/cookies`.
 * The Termly script hydrates the placeholder div and shows the full policy.
 */
const CookiePolicy = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Inject the Termly embed script once; it handles rendering the policy content.
    if (!document.getElementById(TERMLY_POLICY_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = TERMLY_POLICY_SCRIPT_ID;
      script.src = TERMLY_POLICY_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section className="cookie-policy-page">
      <div className="cookie-policy-content">
        <h1>Cookie Policy</h1>
        <p>
          This policy is provided by Termly and may take a moment to load. If it does not appear,
          please refresh the page.
        </p>
        <div
          ref={containerRef}
          name={TERMLY_POLICY_CONTAINER_NAME}
          data-id={TERMLY_POLICY_CONTAINER_DATA_ID}
        />
      </div>
    </section>
  );
};

export default CookiePolicy;
import React from 'react';
import './PrivacyPolicy.css';

const CookiePolicy: React.FC = () => {
  return (
    <div className="policy-page">
      <header className="policy-header">
        <h1 className="policy-title">COOKIE POLICY</h1>
        <p className="policy-updated">
          <span>Last updated</span> <strong>November 11, 2025</strong>
        </p>
      </header>

      <p className="policy-intro">
        This Cookie Policy explains how Koala Station DOO Beograd (doing business as Chiils) ("Chiils", "we", "us", or
        "our") uses cookies and similar technologies when you visit{' '}
        <a href="https://www.chiils.com" target="_blank" rel="noopener noreferrer">
          https://www.chiils.com
        </a>{' '}
        and any related products, services, or communications (collectively, the "Services"). It should be read together
        with our{' '}
        <a href="/privacypolicy">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="/termsofservice">
          Terms of Service
        </a>
        .
      </p>

      <section className="policy-section">
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small data files stored on your device when you visit a website. They help websites remember your
          preferences, improve performance, and deliver relevant content. Similar technologies such as local storage,
          pixels, tags, and scripts serve comparable purposes and are collectively referred to in this policy as
          "cookies."
        </p>
      </section>

      <section className="policy-section">
        <h2>2. How We Use Cookies</h2>
        <p>
          Chiils uses cookies to make the Services work efficiently and to improve your experience. Specifically, we
          use cookies to:
        </p>
        <ul>
          <li>authenticate and keep you signed in to your account,</li>
          <li>remember your preferences (such as language or consent choices),</li>
          <li>protect the platform against fraud and abuse,</li>
          <li>measure usage metrics and understand how features are used, and</li>
          <li>support the delivery of content and lessons generated through the Services.</li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>3. Types of Cookies We Use</h2>
        <p>
          The Consent Preferences link in our footer allows you to view the exact list of cookies that may be in use at
          any time. Depending on your selections, the following categories may be active:
        </p>
        <ul>
          <li>
            <strong>Strictly Necessary Cookies:</strong> Required for the Services to function (for example, to log in
            securely or load core features). These cookies cannot be switched off.
          </li>
          <li>
            <strong>Performance and Analytics Cookies:</strong> Help us understand how the Services are used and
            identify areas for improvement. We only run analytics after you provide consent.
          </li>
          <li>
            <strong>Functional Cookies:</strong> Enable enhanced functionality and personalization, such as remembering
            your preferences or saved settings.
          </li>
          <li>
            <strong>Advertising or Targeting Cookies:</strong> Chiils currently does not run advertising cookies or sell
            personal information. If we ever introduce these technologies, you will be prompted for explicit consent.
          </li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>4. Managing Your Cookie Preferences</h2>
        <p>
          You are in control of your cookie choices. You can adjust your preferences at any time by selecting the{' '}
          <a href="#" className="termly-display-preferences">
            Consent Preferences
          </a>{' '}
          link in our website footer. This link opens the Termly preference center where you can opt in or out of
          non-essential cookies.
        </p>
        <p>
          Most web browsers also allow you to manage cookies via their settings. You can configure your browser to
          refuse cookies, delete them after a session, or alert you when cookies are being placed. If you disable
          essential cookies, some portions of the Services may not function properly.
        </p>
      </section>

      <section className="policy-section">
        <h2>5. Third-Party Cookies and Similar Technologies</h2>
        <p>
          Some cookies may be placed by third parties that provide services on our behalf. These include analytics
          providers, content delivery networks, and security partners. Each third party is responsible for describing
          how they use data in their respective privacy notices. We require all vendors to process information in
          compliance with applicable data-protection laws and our agreements.
        </p>
        <p>
          Termly, our consent management platform, may set its own cookies or scripts to record your preferences. The
          cookie banner script is served from{' '}
          <a
            href="https://app.termly.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://app.termly.io
          </a>{' '}
          and blocks non-essential scripts until you opt in.
        </p>
      </section>

      <section className="policy-section">
        <h2>6. Updates to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy to reflect changes in the cookies we use or to comply with regulatory
          requirements. When changes are made, we will revise the "Last updated" date and, if necessary, notify you by
          displaying a notice on the Services.
        </p>
      </section>

      <section className="policy-section">
        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about this Cookie Policy or how we use cookies, please contact us at{' '}
          <a href="mailto:team@chiils.com">team@chiils.com</a> or write to:
        </p>
        <address>
          Koala Station DOO Beograd
          <br />
          Kneza Mihaila 3, Beograd 11000, Serbia
          <br />
          Serbia
        </address>
      </section>
    </div>
  );
};

export default CookiePolicy;


