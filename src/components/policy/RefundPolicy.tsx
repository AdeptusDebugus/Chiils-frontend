import React from 'react';
import './RefundPolicy.css';

const RefundPolicy: React.FC = () => {
  return (
    <div className="policy-page">
      <header className="policy-header">
        <h1 className="policy-title">REFUND POLICY</h1>
        <p className="policy-updated">
          <span>Last updated</span> <strong>August 8, 2026</strong>
        </p>
      </header>

      <p className="policy-intro">
        This Refund Policy explains how refunds are handled for purchases made through <strong>Chiils</strong>,
        operated by <strong>Koala Station DOO Beograd</strong> ("Company," "we," "us," or "our").
      </p>
      <p className="policy-intro">
        All payments for Chiils are processed securely by <strong>Paddle</strong>, our payment partner and{' '}
        <strong>Merchant of Record</strong>. By purchasing or subscribing to Chiils, you agree to this Refund Policy and
        our Terms of Service and Privacy Policy.
      </p>

      <section className="policy-section">
        <h2>1. Refunds</h2>
        <p>
          Refunds are administered by Paddle as our Merchant of Record, on a case-by-case basis, and may be refused where
          there is evidence of fraud, refund abuse, or other manipulative behaviour.
        </p>
        <p>
          This does not affect your rights as a consumer in relation to Products which are not as described, faulty, or
          not fit for purpose.
        </p>
      </section>

      <section className="policy-section">
        <h2>2. How Refunds Are Handled</h2>
        <p>
          Chiils does not handle refund requests directly and cannot issue refunds or modify payment details. All refund
          decisions are made by Paddle, in accordance with its policies.
        </p>
        <p>
          If you have a billing or refund inquiry, please contact Paddle directly at{' '}
          <a href="https://paddle.net" target="_blank" rel="noopener noreferrer">
            https://paddle.net
          </a>
          .
        </p>
        <p>
          You can also review Paddle&apos;s Refund Policy at{' '}
          <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noopener noreferrer">
            https://www.paddle.com/legal/refund-policy
          </a>{' '}
          and Paddle&apos;s Buyer Terms at{' '}
          <a href="https://www.paddle.com/legal/buyer-terms" target="_blank" rel="noopener noreferrer">
            https://www.paddle.com/legal/buyer-terms
          </a>
          .
        </p>
      </section>

      <section className="policy-section">
        <h2>3. When Refunds May Apply</h2>
        <p>Common circumstances in which Paddle may grant a refund include:</p>
        <ul>
          <li>Duplicate or accidental payment: you were charged more than once for the same purchase;</li>
          <li>Technical error: a verified issue that prevented access to your purchased content;</li>
          <li>Fraudulent transaction: unauthorized activity detected on your payment method.</li>
        </ul>
        <p>
          Statutory withdrawal right: if you are a consumer in the EU, EEA, UK, or another jurisdiction that grants one,
          you may also have the right to withdraw from your purchase within 14 days of the transaction, without giving a
          reason, as described in Section 21 of our Terms of Service. Because Paddle is our Merchant of Record, Paddle
          administers this right and any resulting refund. Where you consented at checkout to immediate access, this
          right ends once you begin using or benefiting from the Services within the 14-day period.
        </p>
        <p>
          These circumstances are in addition to your statutory rights as a consumer, including in relation to Products
          that are not as described, faulty, or not fit for purpose. All refund requests are reviewed and processed
          directly by Paddle.
        </p>
      </section>

      <section className="policy-section">
        <h2>4. Subscriptions and Automatic Renewals</h2>
        <p>Subscriptions renew automatically unless canceled before the next billing cycle.</p>
        <p>
          Canceling your subscription stops future charges but does not automatically entitle you to a refund for the
          current period.
        </p>
        <p>
          You can manage or cancel your subscription at any time from your Chiils account or through the link in your
          Paddle purchase confirmation email.
        </p>
      </section>

      <section className="policy-section">
        <h2>5. Contact Information</h2>
        <p>
          If you have any questions about this Refund Policy or need assistance with your purchase, please contact us
          at:
        </p>
        <p>
          Koala Station DOO Beograd
          <br />
          Kneza Mihaila 3, Beograd 11000, Serbia
          <br />
          Phone: (+381) 677661622
          <br />
          <a href="mailto:team@chiils.com">team@chiils.com</a>
        </p>
      </section>
    </div>
  );
};

export default RefundPolicy;
