import React from 'react';
import './RefundPolicy.css';

const RefundPolicy: React.FC = () => {
  return (
    <div className="policy-page">
      <header className="policy-header">
        <h1 className="policy-title">REFUND POLICY</h1>
        <p className="policy-updated">
          <span>Last updated</span> <strong>December 31, 2025</strong>
        </p>
      </header>

      <p className="policy-intro">
        This Refund Policy explains how refunds are handled for purchases made through <strong>Chiils</strong>,
        operated by <strong>Koala Station DOO Beograd</strong> ("Company," "we," "us," or "our").
      </p>
      <p className="policy-intro">
        All payments for Chiils are processed securely by <strong>Paddle</strong>, our payment partner and{' '}
        <strong>Merchant of Record</strong>. By purchasing or subscribing to Chiils, you agree to this Refund Policy
        and our Terms of Service and Privacy Policy.
      </p>

      <section className="policy-section">
        <h2>1. Refunds</h2>
        <p>
          Refunds are provided at the sole discretion of Paddle (Merchant of Record) and on a case-by-case basis and may be refused. Paddle will refuse a refund request if we find evidence of fraud, refund abuse, or other manipulative behaviour that entitles Paddle to counterclaim the refund.
        </p>
        <p>
          This does not affect your rights as a Consumer in relation to Products which are not as described, faulty or not fit for purpose.
        </p>
      </section>

      <section className="policy-section">
        <h2>2. How Refunds Are Handled</h2>
        <p>
          Chiils does not handle refund requests directly and cannot issue refunds or modify payment details.
        </p>
        <p>
          All refund decisions are made at the discretion of <strong>Paddle</strong>, in accordance with their policies.
        </p>
        <p>If you have a billing or refund inquiry, please contact Paddle directly:</p>
        <p>
          🔗{' '}
          <a href="https://paddle.net/" target="_blank" rel="noopener noreferrer">
            https://paddle.net/
          </a>
        </p>
        <p>You may also find Paddle's official Refund Policy and Buyer Terms here:</p>
        <p>
          🔗{' '}
          <a
            href="https://www.paddle.com/legal/checkout-buyer-terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.paddle.com/legal/checkout-buyer-terms
          </a>
        </p>
      </section>

      <section className="policy-section">
        <h2>3. When Refunds May Apply</h2>
        <p>Refunds may be granted by Paddle only in the following limited circumstances:</p>
        <ul>
          <li>
            <strong>Duplicate or accidental payment</strong> — you were charged more than once for the same purchase;
          </li>
          <li>
            <strong>Technical error</strong> — a verified issue that prevented access to your purchased content;
          </li>
          <li>
            <strong>Fraudulent transaction</strong> — if unauthorized activity is detected on your payment method.
          </li>
        </ul>
        <p>All such requests must be reviewed and processed directly by Paddle.</p>
      </section>

      <section className="policy-section">
        <h2>4. Subscriptions and Automatic Renewals</h2>
        <p>Subscriptions renew automatically unless canceled before the next billing cycle.</p>
        <p>
          Canceling your subscription stops future charges but does not automatically entitle you to a refund for the
          current period.
        </p>
        <p>
          You can manage or cancel your subscription anytime from your Chiils account or through the Paddle purchase
          confirmation email.
        </p>
      </section>

      <section className="policy-section">
        <h2>5. Contact Information</h2>
        <p>
          If you have any questions about this Refund Policy or need assistance with your purchase, please contact us at:
        </p>
        <p>
          Koala Station DOO Beograd
          <br />
          Kneza Mihaila 3, Beograd 11000, Serbia
          <br />
          Phone: (+381)677661622
          <br />
          <a href="mailto:team@chiils.com">team@chiils.com</a>
        </p>
      </section>
    </div>
  );
};

export default RefundPolicy;
