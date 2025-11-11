import { useEffect, useRef, useState } from 'react';

// Termly cookie policy constants – separates markup container and script data.
const TERMLY_POLICY_CONTAINER_NAME = 'termly-embed';
const TERMLY_POLICY_CONTAINER_DATA_ID = 'f289a4cc-7033-4433-a6ae-0fd1193b5cfb';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setAttribute('name', TERMLY_POLICY_CONTAINER_NAME);
      containerRef.current.setAttribute('data-id', TERMLY_POLICY_CONTAINER_DATA_ID);

      // Observe Termly inject its policy content and hide the loading message afterwards.
      const observer = new MutationObserver((mutations, obs) => {
        if (containerRef.current && containerRef.current.childNodes.length > 0) {
          setIsLoading(false);
          obs.disconnect();
        }
      });

      observer.observe(containerRef.current, { childList: true, subtree: true });

      // Cleanup observer on unmount.
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Inject the Termly embed script once; it handles rendering the policy content.
    if (!document.getElementById(TERMLY_POLICY_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = TERMLY_POLICY_SCRIPT_ID;
      script.src = TERMLY_POLICY_SCRIPT_SRC;
      script.async = true;
      script.onload = () => {
        // In case the script loads but Termly takes time to inject content, rely on the observer above.
        if (containerRef.current && containerRef.current.childNodes.length === 0) {
          setIsLoading(true);
        }
      };
      document.body.appendChild(script);
    } else {
      // If the script already exists, ensure the loading state stays visible until Termly repaints.
      if (containerRef.current && containerRef.current.childNodes.length === 0) {
        setIsLoading(true);
      }
    }
  }, []);

  return (
    <section className="cookie-policy-page">
      <div className="cookie-policy-content">
        {isLoading && (
          <p className="cookie-policy-loading" aria-live="polite">
            Loading Cookie Policy…
          </p>
        )}
        <div ref={containerRef} />
      </div>
    </section>
  );
};

export default CookiePolicy;
