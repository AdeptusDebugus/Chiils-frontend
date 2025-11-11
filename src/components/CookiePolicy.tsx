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
    if (containerRef.current) {
      containerRef.current.setAttribute('name', TERMLY_POLICY_CONTAINER_NAME);
      containerRef.current.setAttribute('data-id', TERMLY_POLICY_CONTAINER_DATA_ID);
    }

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
        <div ref={containerRef} />
      </div>
    </section>
  );
};

export default CookiePolicy;
