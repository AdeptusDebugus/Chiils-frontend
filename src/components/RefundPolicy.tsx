import React from 'react';
import './RefundPolicy.css';

const RefundPolicy: React.FC = () => {
  return (
    <div className="policy-page">
      <header className="policy-header">
        <h1 className="policy-title">REFUND POLICY</h1>
        <p className="policy-updated">
          <span>Last updated</span> <strong>November 5, 2025</strong>
        </p>
      </header>

      <p className="policy-intro">
        This Refund Policy explains how refunds are handled for purchases made through <strong>Chiils</strong>,
        operated by <strong>Koala Station DOO Beograd</strong> (“Company,” “we,” “us,” or “our”).
      </p>
      <p className="policy-intro">
        All payments for Chiils are processed securely by <strong>Paddle</strong>, our payment partner and{' '}
        <strong>Merchant of Record</strong>. By purchasing or subscribing to Chiils, you agree to this Refund Policy
        and our Terms of Service and Privacy Policy.
      </p>

      <section className="policy-section">
        <h2>1. Digital Services and Right of Withdrawal</h2>
        <p>
          Chiils provides digital educational services and automatically generated learning materials.
        </p>
        <p>
          Because our content is digital and delivered immediately after purchase,{' '}
          <strong>
            refunds are generally not available once access to the digital content has been granted or lesson generation
            has begun
          </strong>
          .
        </p>
        <p>
          Under <strong>EU Directive 2019/770 on digital content</strong>, consumers waive their right of withdrawal
          once the delivery of digital content begins, provided they have given prior consent during checkout.
        </p>
        <p>
          By completing your purchase, you expressly consent to the immediate delivery of digital content and acknowledge
          that you lose your right to withdraw once access starts.
        </p>
      </section>

      <section className="policy-section">
        <h2>2. How Refunds Are Handled</h2>
        <p>
          All transactions, billing, and refund processing for Chiils are managed exclusively by <strong>Paddle</strong>,
          our Merchant of Record.
        </p>
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
        <p>You may also find Paddle’s official Refund Policy and Buyer Terms here:</p>
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
        <h2>5. Refund Processing</h2>
        <p>
          If your refund request is approved, the refund will be issued through <strong>Paddle</strong> to the{' '}
          <strong>original payment method</strong> used for the purchase.
        </p>
        <p>
          Processing times may vary depending on your payment provider, but refunds are typically completed within{' '}
          <strong>5–10 business days</strong>.
        </p>
        <p>Chiils and Paddle are not responsible for any delays caused by banks or payment networks.</p>
      </section>

      <section className="policy-section">
        <h2>6. Contact Information</h2>
        <p>
          If you have any questions about this Refund Policy or need assistance with your purchase, please contact us at:
        </p>
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

export default RefundPolicy;






