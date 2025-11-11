import { useEffect } from 'react';

// Termly banner constants – keeping IDs centralized makes future updates easier.
const TERMLY_BANNER_SCRIPT_ID = 'termly-consent-script';
const TERMLY_BANNER_SCRIPT_SRC =
  'https://app.termly.io/resource-blocker/27bfff6e-c4a7-4fdb-96e8-97f1de3c582e?autoBlock=on';

/**
 * TermlyBanner
 *
 * Injects the Termly consent banner script once when the component mounts,
 * ensuring the banner is globally available on every page.
 */
const TermlyBanner = () => {
  useEffect(() => {
    // Skip injection if the script already exists to avoid duplicate banners.
    if (document.getElementById(TERMLY_BANNER_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = TERMLY_BANNER_SCRIPT_ID;
    script.src = TERMLY_BANNER_SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default TermlyBanner;

