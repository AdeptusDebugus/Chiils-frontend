import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="policy-page">
      <header className="policy-header">
        <h1 className="policy-title">PRIVACY POLICY</h1>
        <p className="policy-updated">
          <span>Last updated</span> <strong>November 5, 2025</strong>
        </p>
      </header>

      <p className="policy-intro">
        This Privacy Notice for Koala Station DOO Beograd (doing business as Chiils) (“we,” “us,” or “our”) explains
        how we collect, store, use, and protect your personal information when you use our services (“Services”),
        including when you:
      </p>
      <ul className="policy-list">
        <li>
          visit our website{' '}
          <a href="http://www.chiils.com/" target="_blank" rel="noopener noreferrer">
            www.chiils.com
          </a>
          , or
        </li>
        <li>engage with us in other ways (e.g., customer support, marketing, or events).</li>
      </ul>
      <p className="policy-intro">
        If you have questions or concerns, contact us at{' '}
        <a href="mailto:team@chiils.com">team@chiils.com</a>.
      </p>

      <section className="policy-section">
        <h2>1. What Information Do We Collect?</h2>
        <h3>Personal Information You Provide to Us</h3>
        <p>
          We collect only the personal information necessary to operate and improve our Services. This includes:
        </p>
        <ul>
          <li>
            your <strong>email address</strong> and, where available, your <strong>name</strong> (when signing in with
            Google);
          </li>
          <li>technical identifiers used to manage your account (such as a user ID or session token).</li>
        </ul>
        <p>
          All registration and authentication are handled securely. If you use Google Sign-In, we receive only your name
          and email address. We do not access or store any other data from your Google account.
        </p>

        <h3>Billing and Payment Information</h3>
        <p>
          All payment and billing information — such as billing address, payment method, or tax data — is processed and
          stored exclusively by <strong>Paddle</strong>, our payment partner and Merchant of Record. Chiils does{' '}
          <strong>not</strong> store or have access to your payment card details or transaction records. You can review
          Paddle’s privacy policy here:{' '}
          <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer">
            https://www.paddle.com/legal/privacy
          </a>
          .
        </p>

        <h3>Automatically Collected Data</h3>
        <p>
          When you use the Services, we automatically collect limited technical information to ensure stability,
          performance, and security. This may include:
        </p>
        <ul>
          <li>your IP address, browser type, operating system, and device details;</li>
          <li>usage data such as time spent, pages visited, and features used;</li>
          <li>anonymized diagnostic information for performance monitoring.</li>
        </ul>
        <p>
          In the future, we may use <strong>Google Analytics</strong> or similar analytics tools to understand how users
          interact with our Services and to improve the user experience. If activated, analytics will operate with{' '}
          <strong>IP anonymization enabled</strong> and will respect cookie consent preferences as required by applicable
          data-protection laws.
        </p>
        <p>
          We also use cookies and analytics as described in our Cookie Policy at{' '}
          <a href="https://chiils.com/cookies" target="_blank" rel="noopener noreferrer">
            https://chiils.com/cookies
          </a>
          .
        </p>

        <h3>Content You Submit</h3>
        <p>
          When you use Chiils to generate educational content, we may temporarily process the materials you provide —
          such as video or podcast links, short texts, or prompts — solely to generate lessons. These materials are
          processed automatically and are not stored permanently or reused for any other purpose.
        </p>
      </section>

      <section className="policy-section">
        <h2>2. How Do We Process Your Information?</h2>
        <p>We process personal information to:</p>
        <ul>
          <li>create and manage user accounts,</li>
          <li>provide and improve Services,</li>
          <li>deliver generated lessons and educational materials,</li>
          <li>respond to user inquiries and support requests,</li>
          <li>send administrative communications (e.g., updates, policy changes),</li>
          <li>prevent fraud, misuse, and ensure security,</li>
          <li>comply with legal obligations.</li>
        </ul>
        <p>We do <strong>not</strong> use your data for unrelated profiling or advertising without consent.</p>
      </section>

      <section className="policy-section">
        <h2>3. Legal Bases for Processing (GDPR)</h2>
        <p>We process personal data only when we have a valid legal basis, including:</p>
        <ul>
          <li>
            <strong>Performance of a contract:</strong> to deliver and manage your subscription or lesson generation.
          </li>
          <li>
            <strong>Legitimate interests:</strong> to maintain and improve the platform, prevent abuse, and ensure
            security.
          </li>
          <li>
            <strong>Legal obligation:</strong> to comply with tax, accounting, or data protection laws.
          </li>
          <li>
            <strong>Consent:</strong> for analytics, cookies, and optional marketing communications.
          </li>
        </ul>
        <p>
          You may withdraw your consent at any time by contacting us at{' '}
          <a href="mailto:team@chiils.com">team@chiils.com</a>.
        </p>
      </section>

      <section className="policy-section">
        <h2>4. When and With Whom Do We Share Data</h2>
        <p>We may share personal data only when necessary for service provision, compliance, or improvement.</p>
        <p>Third parties include:</p>
        <ul>
          <li>
            <strong>Paddle</strong> (payment processing and billing),
          </li>
          <li>
            <strong>Gladia</strong> and <strong>OpenAI</strong> (AI-based transcription and text generation),
          </li>
          <li>
            <strong>Google Analytics</strong> (anonymous analytics).
          </li>
        </ul>
        <p>We do not sell personal data.</p>
      </section>

      <section className="policy-section">
        <h2>5. Cookies and Analytics</h2>
        <p>We use cookies and similar technologies for essential functionality, analytics, and improving user experience.</p>
        <p>
          We may share your information with Google Analytics to track and analyze the use of the Services. To opt out of
          being tracked by Google Analytics across the Services, visit{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            https://tools.google.com/dlpage/gaoptout
          </a>
          . For more information on the privacy practices of Google, please visit the Google Privacy &amp; Terms page. You
          can manage your preferences through the cookie banner or browser settings. For full details, see our Cookie
          Policy at{' '}
          <a href="https://chiils.com/cookies" target="_blank" rel="noopener noreferrer">
            https://chiils.com/cookies
          </a>
          .
        </p>
      </section>

      <section className="policy-section">
        <h2>6. Artificial Intelligence (AI) Processing</h2>
        <p>
          Chiils uses AI to generate educational content. When you submit a video, podcast, or text, related information
          (including transcripts and selected excerpts) may be temporarily processed by our AI service providers (Gladia
          and OpenAI). These providers process data under contractual safeguards and do <strong>not</strong> use it to
          train public models. We do <strong>not</strong> allow users to upload or include personal or sensitive data in AI
          prompts.
        </p>
      </section>

      <section className="policy-section">
        <h2>7. Social Logins</h2>
        <p>
          If you register using a social media account (e.g., Google, Facebook), we receive limited information such as
          name, email, and profile picture from the provider.
        </p>
        <p>This data is used only for account creation and authentication.</p>
      </section>

      <section className="policy-section">
        <h2>8. Data Retention</h2>
        <p>
          We keep personal data only as long as necessary to provide Services or comply with legal obligations. Generated
          lessons, transcripts, and uploads are stored temporarily (typically up to 90 days) and deleted automatically
          unless needed for ongoing user access or legal compliance.
        </p>
      </section>

      <section className="policy-section">
        <h2>9. Data Security</h2>
        <p>
          We implement technical and organizational measures to safeguard your information, including encryption and
          secure access control. However, no system is completely secure, and transmission of data over the internet is at
          your own risk.
        </p>
      </section>

      <section className="policy-section">
        <h2>10. Minors</h2>
        <p>
          Chiils does not knowingly collect data from individuals under 18. If we learn that such data was provided, we
          will delete it immediately.
        </p>
      </section>

      <section className="policy-section">
        <h2>11. Your Rights Under GDPR</h2>
        <p>
          Depending on where you live, you may have certain rights regarding your personal information under
          data-protection laws such as the <strong>GDPR</strong> (Europe) and various <strong>US state privacy laws</strong>{' '}
          (including CCPA, CPRA, and others).
        </p>
        <p>These rights may include the ability to:</p>
        <ul>
          <li>request access to the personal data we hold about you,</li>
          <li>request correction or deletion of your personal information,</li>
          <li>restrict or object to certain processing activities,</li>
          <li>withdraw your consent (where applicable), and</li>
          <li>request a copy of your data in a portable format.</li>
        </ul>
        <p>You can exercise these rights in two ways:</p>
        <ol>
          <li>
            <strong>Submit a request using our Data Access Form:</strong>{' '}
            <a href="https://app.termly.io/dsar/4da40248-c4f8-451a-b03e-f9cba174058b" target="_blank" rel="noopener noreferrer">
              https://app.termly.io/dsar/4da40248-c4f8-451a-b03e-f9cba174058b
            </a>
          </li>
          <li>
            <strong>Contact us directly</strong> at{' '}
            <a href="mailto:team@chiils.com">team@chiils.com</a> if you prefer to make your request manually.
          </li>
        </ol>
        <p>
          We will verify your identity before processing the request and respond within the time limits required by
          applicable data-protection laws.
        </p>
      </section>

      <section className="policy-section">
        <h2>12. United States Privacy Notice</h2>
        <p>
          If you are a resident of the United States, you may have certain rights regarding your personal information
          under applicable state privacy laws, including the California Consumer Privacy Act (CCPA), the California Privacy
          Rights Act (CPRA), and similar laws in other states.
        </p>
        <p>
          Chiils does <strong>not</strong> sell or share personal information for monetary or marketing purposes. We
          collect only the data necessary to provide our Services (such as account details and payment information) and to
          comply with legal obligations.
        </p>
        <p>Depending on your state of residence, you may have the right to:</p>
        <ul>
          <li>request access to the personal data we hold about you,</li>
          <li>request correction or deletion of your personal data,</li>
          <li>opt out of certain data uses (e.g., targeted advertising, profiling), and</li>
          <li>not be discriminated against for exercising these rights.</li>
        </ul>
        <p>
          To exercise these rights, please contact us at{' '}
          <a href="mailto:team@chiils.com">team@chiils.com</a>. We will verify and respond to your request in accordance
          with applicable state privacy laws.
        </p>
      </section>

      <section className="policy-section">
        <h2>13. International Data Transfers</h2>
        <p>
          Your data is stored on servers located in the <strong>European Union (Netherlands)</strong>. Some processing
          occurs in <strong>Serbia</strong>, where our company is registered. We rely on <strong>Standard Contractual
          Clauses</strong> and equivalent safeguards for any cross-border transfers.
        </p>
      </section>

      <section className="policy-section">
        <h2>14. Do-Not-Track &amp; Opt-Outs</h2>
        <p>
          We do not currently respond to Do-Not-Track (DNT) signals. You can control cookies and analytics preferences via
          browser settings or our cookie banner.
        </p>
      </section>

      <section className="policy-section">
        <h2>15. Updates to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. The “Last updated” date will always reflect the most recent
          version. Material changes will be communicated via website notice or email.
        </p>
      </section>

      <section className="policy-section">
        <h2>16. Contact Us</h2>
        <address>
          Koala Station DOO Beograd
          <br />
          Kneza Mihaila 3, Beograd 11000, Serbia
          <br />
          11000
          <br />
          Serbia
          <br />
          Phone: (+381)677661622
          <br />
          <a href="mailto:team@chiils.com">team@chiils.com</a>
        </address>
      </section>
    </div>
  );
};

export default PrivacyPolicy;






