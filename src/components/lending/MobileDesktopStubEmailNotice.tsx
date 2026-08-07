import React from 'react';
import { Link } from 'react-router-dom';
import './MobileDesktopStub.css';

const imgChiilsBlackLogo = "/assets/chiils-black-logo.svg";

interface MobileDesktopStubEmailNoticeProps {
  onBack: () => void;
  onClose: () => void;
}

const MobileDesktopStubEmailNotice: React.FC<MobileDesktopStubEmailNoticeProps> = ({ onBack, onClose }) => {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className="mobile-desktop-stub" role="dialog" aria-modal="true" aria-label="Check your inbox">
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

        <h2>Good! Check your inbox</h2>
        <p className="mobile-desktop-stub-copy">
          We just emailed you a link. Open it on your laptop to build your lesson.
        </p>

        <button type="button" className="mobile-desktop-stub-continue" onClick={onClose}>
          Close
        </button>

        <p className="mobile-desktop-stub-legal">
          By submitting an email, you agree to our <Link to="/termsofservice">Terms &amp; Conditions</Link> and{' '}
          <Link to="/privacypolicy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default MobileDesktopStubEmailNotice;
