import React from 'react';
import { Link } from 'react-router-dom';
import './MobileDesktopStub.css';

const imgChiilsBlackLogo = "/assets/chiils-black-logo.svg";
const imgMobileStub = "/assets/lending/stub_for_moblie.webp";

const rawApiBase = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : '';
const normalizedApiBase = (typeof window !== 'undefined' && window.location.protocol === 'https:')
  ? rawApiBase.replace(/^http:\/\//, 'https://')
  : rawApiBase;
const subscribeEmailUrl = normalizedApiBase
  ? `${normalizedApiBase}/api/v1/notifications/subscribe-email`
  : '/api/v1/notifications/subscribe-email';

interface MobileDesktopStubProps {
  onBack: () => void;
  onContinue?: () => void;
}

const MobileDesktopStub: React.FC<MobileDesktopStubProps> = ({ onBack, onContinue }) => {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onBack();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onBack]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus('error');
      setMessage('Please enter your email.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus('error');
      setMessage('Please enter a valid email.');
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch(subscribeEmailUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Subscribe email request failed: ${response.status}`);
      }

      setStatus('success');
      setMessage('Done. We sent the link to your email.');
      onContinue?.();
    } catch (error) {
      console.error('Email subscription notification failed:', error);
      setStatus('error');
      setMessage('Could not send the link. Please try again.');
    }
  };

  return (
    <div className="mobile-desktop-stub" role="dialog" aria-modal="true" aria-label="Desktop-only notice">
      <div className="mobile-desktop-stub-panel">
        <div className="mobile-desktop-stub-top">
          <img src={imgChiilsBlackLogo} alt="Chiils" className="mobile-desktop-stub-logo" />
        </div>
        <button
          className="mobile-desktop-stub-back"
          type="button"
          aria-label="Go back"
          onClick={onBack}
        >
          <img src="/assets/go-back.svg" alt="" aria-hidden="true" />
          Go back
        </button>

        <h2>Built for typing, not tapping</h2>
        <p className="mobile-desktop-stub-copy">
          Chiils was built for a bigger screen. Leave your email and we'll send a link so you can pick this up
          later.
        </p>
        <img src={imgMobileStub} alt="" aria-hidden="true" className="mobile-desktop-stub-image" />

        <form className="mobile-desktop-stub-form" onSubmit={handleSubmit}>
          <label className="mobile-desktop-stub-email-label" htmlFor="mobile-desktop-stub-email">
            Email
          </label>
          <input
            id="mobile-desktop-stub-email"
            className="mobile-desktop-stub-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="youareamazing@email.com"
            value={email}
            disabled={status === 'sending'}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status !== 'sending') {
                setStatus('idle');
                setMessage('');
              }
            }}
          />
          {message && (
            <p className={`mobile-desktop-stub-message ${status === 'success' ? 'success' : 'error'}`}>
              {message}
            </p>
          )}
          <button type="submit" className="mobile-desktop-stub-continue" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send me the link'}
          </button>
        </form>

        <p className="mobile-desktop-stub-legal">
          By submitting an email, you agree to our <Link to="/termsofservice">Terms &amp; Conditions</Link> and{' '}
          <Link to="/privacypolicy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default MobileDesktopStub;
