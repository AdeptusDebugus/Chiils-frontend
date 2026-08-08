import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLessonBuilder } from '../../contexts/LessonBuilderContext.tsx';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthPrompt } from '../../contexts/AuthPromptContext.tsx';
import './LandingPage.css';
import Footer from '../footer/Footer.tsx';
import ComparePlansPopup from './ComparePlansPopup.tsx';
import MobileDesktopStub from './MobileDesktopStub.tsx';
import MobileDesktopStubEmailNotice from './MobileDesktopStubEmailNotice.tsx';
import YouTubeIFrameApiPlayer from '../common/YouTubeIFrameApiPlayer';

//IMAGES
const imgHeroImage = "/assets/lending/about-hero-human.webp";
const imgChiilsLogo = "/assets/chiils-white-logo.svg";
const imgFeatureCardSmall1 = "/assets/lending/feature-card-small-1.svg";
const imgFeatureCardSmall2 = "/assets/lending/feature-card-small-2.svg";
const imgPricingBackground = "/assets/lending/pricing-background.webp";
const imgAboutBackground = "/assets/lending/about-background.webp";
const imgLessonBuilderBackground = "/assets/lending/openlib-background.webp";
const imgLessonBuilderMobileBackground = "/assets/lending/mobile-openlib-background.webp";
const imgLessonBuilderMobilePicture = "/assets/lending/mobile-lesson-builder.webp";
const imgOpenLibBackground = "/assets/lending/openlib-background.webp";
const imgOpenLibMobileBackground = "/assets/lending/mobile-openlib-background.webp";
const imgOpenLibMobileGroup = "/assets/lending/mobile-open-lib.webp";
const imgOpenLibCardFrame = "/assets/lending/open-library.webp";
const imgFAQProfile1 = "/assets/lending/portrait-1.webp";
const imgFAQProfile2 = "/assets/lending/portrait-2.webp";
const imgFAQProfile3 = "/assets/lending/portrait-3.webp";
const imgFAQProfile4 = "/assets/lending/portrait-4.webp";
const imgFAQProfile5 = "/assets/lending/portrait-5.webp";
const imgJoyfulWomanPortrait = "/assets/lending/cta-background.webp";
const imgArrowButton = "/assets/lending/arrow-button.svg";
const imgLessonBuilderTop = "/assets/lending/lesson-builder-top.webp";
const imgLessonBuilderBot = "/assets/lending/lesson-builder-bot.webp";
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openLessonBuilder } = useLessonBuilder();
  const { isAuthenticated, logout } = useAuth();
  const { openAuthPrompt } = useAuthPrompt();
  const [showComparePopup, setShowComparePopup] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobilePlansOpen, setIsMobilePlansOpen] = React.useState(false);
  const [isMobileStubOpen, setIsMobileStubOpen] = React.useState(false);
  const [mobileStubStep, setMobileStubStep] = React.useState<'form' | 'notice'>('form');
  const [expandedFaqIndex, setExpandedFaqIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isMobileMenuOpen && !isMobileStubOpen && !isMobilePlansOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMobilePlansOpen) {
          setIsMobilePlansOpen(false);
        } else if (isMobileStubOpen) {
          setIsMobileStubOpen(false);
        } else {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, isMobileStubOpen, isMobilePlansOpen]);

  const isMobileViewport = () => window.matchMedia('(max-width: 839px)').matches;

  const runWithMobileStub = (action: () => void) => {
    if (isMobileViewport()) {
      setIsMobileStubOpen(true);
      setMobileStubStep('form');
      return;
    }

    action();
  };

  const closeMobileStub = () => {
    setIsMobileStubOpen(false);
    setIsMobileMenuOpen(false);
    setMobileStubStep('form');
  };

  const handleSignUp = () => {
    runWithMobileStub(() => navigate('/login'));
  };

  const handleSignIn = () => {
    runWithMobileStub(() => navigate('/login', { state: { hideSignInLink: true } }));
  };

  const handleOpenLib = () => {
    setIsMobileMenuOpen(false);
    navigate('/open-library');
  };

  const handleLessonBuilder = () => {
    runWithMobileStub(() => {
      if (isAuthenticated) {
        navigate('/open-library');
        openLessonBuilder();
      } else {
        openAuthPrompt();
      }
    });
  };

  const handleMobileHome = () => {
    setIsMobileMenuOpen(false);
    navigate('/');
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  const handleMobileSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleMobileSupport = () => {
    setIsMobileMenuOpen(false);
    window.open('https://tally.so/r/KYlp6V', '_blank', 'noopener,noreferrer');
  };

  const handleMobileEmail = () => {
    setIsMobileMenuOpen(false);
    window.location.href = 'mailto:team@chiils.com';
  };

  const handleToolsClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest('button, a')) {
      return;
    }

    const container = event.currentTarget;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (maxScrollLeft <= 0) {
      return;
    }

    const nextScrollLeft = container.scrollLeft >= maxScrollLeft - 8 ? 0 : maxScrollLeft;
    container.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
  };

  const handleLandingLinkCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isMobileViewport() || isMobileStubOpen) {
      return;
    }

    const target = event.target as HTMLElement;
    const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor || !event.currentTarget.contains(anchor) || anchor.closest('.mobile-desktop-stub')) {
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    runWithMobileStub(() => {
      if (href.startsWith('#')) {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (href.startsWith('mailto:')) {
        window.location.href = href;
        return;
      }

      if (href.startsWith('http')) {
        window.open(anchor.href, anchor.target || '_self', 'noopener,noreferrer');
        return;
      }

      navigate(href);
    });
  };

  const faqItems = [
    {
      question: 'How is it different from Chat GPT and other LLMs?',
      answer: 'Chiils delivers a complete, beautifully structured lesson in a couple of clicks. No prompts, no setup, no back-and-forth. You bring the content, Chiils does the rest.'
    },
    {
      question: 'Can I share my lessons with students?',
      answer: 'Yes! You can share your full lesson with students by email. They just need to log in to start working with it.'
    },
    {
      question: 'How long does it take to create a custom lesson?',
      answer: "It depends on the length of your video. Usually 5 to 10 minutes, though longer videos can take a bit more."
    },
    {
      question: 'Are there any limits or rules I should know about?',
      answer: 'Just a few. Chiils works with public videos and podcasts under 60 minutes. Private links aren\'t supported. Everything else is wide open.'
    },
    {
      question: 'Do I need to know how to use AI tools?',
      answer: 'Not at all. Chiils was built to make AI feel invisible. You don\'t even need to write a prompt.'
    }
  ];

  return (
    <div className="home-page" data-name="Public Space" onClickCapture={handleLandingLinkCapture}>
      {/* Navigation Header - Matching Figma Design */}
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <img src={imgHeroImage} alt="Hero" className="hero-image" />
        </div>
        <div className="hero-overlay"></div>

        {/* Navigation Header - Inside Hero Section for overlay effect, but using main-container */}
        <div className="header" data-name="Header">
          <div className="main-container">
            <div className="header-content">
              {/* Logo */}
              <div className="header-logo" data-name="Logo">
                <img alt="Chiils" src={imgChiilsLogo} className="logo-chiils-img" />
              </div>

              <button
                className="mobile-menu-button"
                type="button"
                aria-label="Open navigation menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <img src="/assets/lending/burger.svg" alt="" aria-hidden="true" />
              </button>

              {/* Navigation Links */}
              <div className="nav-links">
                <a href="#about" className="nav-link nav-about">About</a>
                <a href="#tools" className="nav-link nav-tools">Tools</a>
                <a href="#pricing" className="nav-link nav-pricing">Pricing</a>
              </div>

              <div className="header-buttons">
                {isAuthenticated ? (
                  <>
                    <button className="logout-btn" onClick={logout}>Log out</button>
                    <Link to="/home" className="user-btn-link">
                      <div className="user-btn">
                        <img src="/assets/user.svg" alt="User Profile" />
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <button className="login-btn" onClick={handleSignIn}>Log in</button>
                    <button className="sign-up-btn" onClick={handleSignUp}>Sign up</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-content">
          <div className="main-container">
            <div className="hero-title-row">
              <h1 className="hero-title">
                Teach real language.<br />No busywork.
              </h1>
              <div className="hero-subtitle-lines">
                <p className="hero-subtitle-line">Turn videos into a ready-to-teach lessons</p>
                <p className="hero-subtitle-line">in a couple of clicks.</p>
              </div>
            </div>

            <Link to="/login" className="student-link">
              <span className="student-text">I’m a student</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M13.9036 11.3237C15.3158 11.0018 17.0469 10.5645 18.459 10.1985C19.1803 10.0117 19.1803 8.98827 18.459 8.8015C17.0469 8.43554 15.3158 7.99822 13.9036 7.6763C14.675 6.44937 15.5891 4.9157 16.3286 3.65992C16.7067 3.0176 15.9824 2.29329 15.3401 2.67139C14.0828 3.41089 12.5491 4.32653 11.3237 5.0964C11.0018 3.68422 10.5645 1.95315 10.1985 0.540959C10.0117 -0.18032 8.98828 -0.18032 8.8015 0.540959C8.43555 1.95315 7.99822 3.68422 7.6763 5.0964C6.44937 4.32502 4.91571 3.41089 3.65993 2.67139C3.01761 2.29329 2.29329 3.0176 2.67139 3.65992C3.41089 4.91722 4.32653 6.45089 5.0964 7.6763C3.68422 7.99822 1.95315 8.43554 0.540959 8.8015C-0.18032 8.98827 -0.18032 10.0117 0.540959 10.1985C1.95315 10.5645 3.68422 11.0018 5.0964 11.3237C4.32502 12.5506 3.41089 14.0843 2.67139 15.3401C2.29329 15.9824 3.01761 16.7067 3.65993 16.3286C4.91723 15.5891 6.45089 14.6735 7.6763 13.9036C7.99822 15.3158 8.43555 17.0469 8.8015 18.459C8.98828 19.1803 10.0117 19.1803 10.1985 18.459C10.5645 17.0469 11.0018 15.3158 11.3237 13.9036C12.5506 14.675 14.0843 15.5891 15.3401 16.3286C15.9824 16.7067 16.7067 15.9824 16.3286 15.3401C15.5891 14.0828 14.6735 12.5491 13.9036 11.3237Z" fill="white" />
              </svg>
            </Link>

            <div className="hero-buttons">
              <button className="community-lessons-btn" onClick={handleOpenLib}>Explore the library</button>
              <button className="first-lesson-btn" onClick={handleLessonBuilder}>Create a lesson →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="features-cards-section" id="about">
          <div className="video-demo-section">
            <div className="about-background">
              <img src={imgAboutBackground} alt="Hero" className="hero-image" />
            </div>
            <div className="main-container">
              <div className="video-demo-placeholder">
                <video
                  src="https://ietwfbbswfenycwrkuqq.supabase.co/storage/v1/object/public/Demo%20video/Chiils%20main%20demo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  controlsList="nodownload noremoteplayback noplaybackrate"
                />
              </div>
          </div>
        </div>

        <div className="main-container">
          {/* Section Title */}
          <h2 className="focus-on-teaching-title">
            Focus on teaching <br />— we handle the prep.
          </h2>

          <div className="features-cards-container">
            {/* Card 1 */}
            <div className="feature-card-small">
              <h3 className="feature-card-title">Create custom lessons in a couple of clicks</h3>
              <div className="feature-card-divider"></div>
              <p className="feature-card-text">Spend less time preparing and more time actually teaching.</p>
              <div className="feature-icon-wrapper">
                <img src={imgFeatureCardSmall1} alt="Feature icon" className="feature-icon-img" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="feature-card-small">
              <h3 className="feature-card-title">Keep your students motivated longer</h3>
              <div className="feature-card-divider"></div>
              <p className="feature-card-text">Use authentic content that matches their interests, level and goals.</p>
              <div className="feature-icon-wrapper">
                <img src={imgFeatureCardSmall2} alt="Feature icon" className="feature-icon-img" />
              </div>
            </div>

            {/* Card 3 (Large) */}
            <div className="feature-card-large">
              <h3 className="feature-card-title">Stand out and keep your schedule full</h3>
              <div className="feature-card-divider"></div>
              <p className="feature-card-text">
                Build a teaching experience students want to return to. Chiils offers you a modern tool to teach smarter, stay current, and show your students what real language learning feels like.
              </p>
              <div className="feature-large-card-icon-wrapper">
                <button className="create-first-lesson-btn" onClick={handleLessonBuilder}>
                  Create your first lesson →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="tools-section" id="tools">
        <div className="main-container">
          <h2 className="tools-section-title">
            Spark chills in every lesson.<br />Explore our tools.
          </h2>

          <div className="tools-container" onClick={handleToolsClick}>
            {/* Open Library Card */}
            <div className="tool-card-large open-library-tool-card-v2">
              <div className="openlib-v2-bg" aria-hidden="true">
                <img className="openlib-v2-bg-desktop" src={imgOpenLibBackground} alt="" />
                <img className="openlib-v2-bg-mobile" src={imgOpenLibMobileBackground} alt="" />
              </div>

              <div className="openlib-v2-header">
                <h3>Open Library</h3>
                <div className="openlib-v2-divider" aria-hidden="true"></div>
                <p className="openlib-v2-description">A growing library of ready-to-use lessons you can teach right away.</p>
                <button className="openlib-v2-arrow" onClick={handleOpenLib} aria-label="Open Library">
                  <img src={imgArrowButton} alt="" />
                </button>
              </div>

              <div className="openlib-v2-panel" aria-hidden="true">
                <img className="openlib-v2-panel-image openlib-v2-panel-desktop" src={imgOpenLibCardFrame} alt="" />
                <img className="openlib-v2-panel-image openlib-v2-panel-mobile" src={imgOpenLibMobileGroup} alt="" />
              </div>
            </div>

            {/* Lesson Builder Card */}
            <div className="tool-card-large lesson-builder-tool-card-v2">
              <div className="lessonbuilder-v2-bg" aria-hidden="true">
                <img className="lessonbuilder-v2-bg-desktop" src={imgLessonBuilderBackground} alt="" />
                <img className="lessonbuilder-v2-bg-mobile" src={imgLessonBuilderMobileBackground} alt="" />
              </div>

              <div className="lessonbuilder-v2-header">
                <h3>Lesson Builder</h3>
                <div className="lessonbuilder-v2-divider" aria-hidden="true"></div>
                <p className="lessonbuilder-v2-description">
                  A video-to-lesson tool for creating custom lessons in a couple of clicks.
                </p>
                <button className="lessonbuilder-v2-arrow" onClick={handleLessonBuilder} aria-label="Lesson Builder">
                  <img src={imgArrowButton} alt="" />
                </button>
              </div>

              <div className="lessonbuilder-v2-panel" aria-hidden="true">
                <img className="lessonbuilder-v2-image lessonbuilder-v2-panel-desktop" src={imgLessonBuilderTop} alt="" />
                <img className="lessonbuilder-v2-image lessonbuilder-v2-panel-desktop" src={imgLessonBuilderBot} alt="" />
                <img className="lessonbuilder-v2-image lessonbuilder-v2-panel-mobile" src={imgLessonBuilderMobilePicture} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section" id="pricing">
        <div className="pricing-background">
          <img src={imgPricingBackground} alt="Pricing Background" />
        </div>
        <div className="main-container">
          <div className="pricing-content">
            <div className="pricing-header">
              <h2 className="pricing-title">Plans that keep the thrill alive.</h2>
              <p className="pricing-text">
                Minutes are counted by actual video length. 1 minute of video = 1 minute used.
                <br />
                Start / Plus plans include a 7-day free trial. Cancel anytime.
              </p>
            </div>
            <div className="pricing-cards">
              {/* Open Library Card */}
              <div className="pricing-card">
                <h3>Open Library</h3>
                <div className="pricing-divider"></div>
                <p className="price">€5<span>/ month</span></p>
                <ul className="price-features">
                  <li>Full access to the Open Library</li>
                  <li>Ready-made lessons created by Chiils community</li>
                  <li>Interactive flashcards</li>
                  <li>Interactive exercises</li>
                  <li>Grammar hints</li>
                </ul>
                <button className="get-started-btn" onClick={handleSignUp}>
                  <span className="btn-text">Sign up</span>
                </button>
              </div>

              {/* Start Card */}
              <div className="pricing-card">
                <h3>Start</h3>
                <div className="pricing-divider"></div>
                <p className="price">€10<span>/ month</span></p>
                <ul className="price-features">
                  <li>7 days / 60 minutes free trial</li>
                  <li>Everything on Open Library</li>
                  <li>Lesson Builder for creating your own lessons</li>
                  <li>300 minutes / month after trial</li>
                </ul>
                <button className="get-started-btn" onClick={handleSignUp}>
                  <span className="btn-text">Start for free</span>
                </button>
              </div>

              {/* Plus Card */}
              <div className="pricing-card">
                <div className="recommended-header">
                  <h3>Plus</h3>
                  <p className="recommended">Recommended 🔥</p>
                </div>
                <div className="pricing-divider"></div>
                <p className="price">€20<span>/ month</span></p>
                <ul className="price-features">
                  <li>7 days / 60 minutes free trial</li>
                  <li>Everything on Start</li>
                  <li>Lesson Builder for creating your own lessons</li>
                  <li>600 minutes / month after trial</li>
                </ul>
                <button className="get-started-btn" onClick={handleSignUp}>
                  <span className="btn-text">Start for free</span>
                </button>
              </div>

            </div>
            <button
              className="compare-plan-btn"
              onClick={() => {
                if (isMobileViewport()) {
                  setIsMobilePlansOpen(true);
                  return;
                }
                setShowComparePopup(true);
              }}
            >
              Compare plans →
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section" id="faq">
        <div className="main-container">
          <div className="faq-section-header">
            <div className="faq-section-left">
              <h2 className="section-title">Answers for the
                <br />
                curious</h2>
              <p className="faq-intro">
                Here are some answers to frequently asked questions that might help you get started.
                <br />
                <br />
                If you don't find what you're looking for, just email us at <strong>team@chiils.com</strong>
                <br />
                — we'll be happy to help.
              </p>
            </div>
            <div className="faq-grid">
              {faqItems.map((faq, index) => {
                const isExpanded = expandedFaqIndex === index;

                return (
                  <div className={`faq-card ${isExpanded ? 'faq-card-expanded' : ''}`} key={faq.question}>
                    <div className="faq-profile-image">
                    </div>
                    <div className="faq-content">
                      <button
                        type="button"
                        className="faq-question-btn"
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                      >
                        <span className="faq-question-text">{faq.question}</span>
                      </button>
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {false}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-background">
          <img src={imgJoyfulWomanPortrait} alt="Background" />
        </div>
        <div className="main-container">
          <div className="cta-content">
            <h2 className="cta-title">Language is a thrill
              <br />
              — and teaching it should
              <br />
              feel that way too</h2>
          </div>
        </div>

        <div className="cta-bottom-bar">
          {/* cta-bottom-bar is absolute in design, but we might want to constrain it.
              However, if it's a bar at the bottom, it might need to be full width.
              Let's check the design requirement. "Align body text left within a centered narrow column".
              The CTA bar seems to be a full-width bar with content inside.
              I will keep it as is but ensure inner content is centered.
          */}
          <div className="cta-bar-inner">
            <div className="cta-text-group">
              <p>Start teaching smarter today.</p>
              <p>Your first lesson is free.</p>
              <button className="cta-button" onClick={handleLessonBuilder}>Create your first lesson</button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <Footer />
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="mobile-menu-panel">
            <div className="mobile-menu-top">
              <img src={imgChiilsLogo} alt="Chiils" className="mobile-menu-logo" />
              <button
                className="mobile-menu-close"
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                x
              </button>
            </div>

            <nav className="mobile-menu-nav" aria-label="Mobile navigation links">
              <button type="button" onClick={handleMobileHome}>Home</button>
              <button type="button" onClick={handleOpenLib}>Open Library</button>
              <button type="button" onClick={() => handleMobileSection('tools')}>Tools</button>
              <button type="button" onClick={() => handleMobileSection('pricing')}>Pricing</button>
              <button type="button" onClick={() => handleMobileSection('faq')}>Questions &amp; Answers</button>
              <button type="button" className="mobile-menu-nav-disabled-auth" disabled aria-disabled="true">
                Log in / Sign up
              </button>
              <p className="mobile-menu-nav-disabled-note">Available on Desktop</p>
            </nav>

            <div className="mobile-menu-actions">
              <button type="button" onClick={handleMobileSupport}>
                Contact support
              </button>
              <button type="button" onClick={handleMobileEmail}>team@chiils.com</button>
            </div>
          </div>
        </div>
      )}

      {isMobileStubOpen && (
        mobileStubStep === 'notice' ? (
          <MobileDesktopStubEmailNotice
            onBack={() => setMobileStubStep('form')}
            onClose={closeMobileStub}
          />
        ) : (
          <MobileDesktopStub
            onBack={closeMobileStub}
            onContinue={() => setMobileStubStep('notice')}
          />
        )
      )}

      {isMobilePlansOpen && (
        <div className="mobile-plans-overlay" role="dialog" aria-modal="true" aria-label="Compare plans">
          <div className="mobile-plans-frame">
            <h2 className="mobile-plans-title">Plans that keep the thrill alive.</h2>

            <div className="mobile-plans-table-wrap">
              <table className="mobile-plans-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>
                      <span>Free</span>
                      <span>0 EUR / month</span>
                    </th>
                    <th>
                      <span>Open Library</span>
                      <span>5 EUR / month</span>
                    </th>
                    <th>
                      <span>Start</span>
                      <span>10 EUR / month</span>
                    </th>
                    <th>
                      <span>Plus</span>
                      <span>20 EUR / month</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Community lessons</td><td>Preview</td><td>Full</td><td>Full</td><td>Full</td></tr>
                  <tr><td>Flashcards &amp; Quizlet export</td><td>Preview</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                  <tr><td>Grammar hints</td><td>Preview</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                  <tr><td>Lesson builder</td><td>No</td><td>No</td><td>Yes</td><td>Yes</td></tr>
                  <tr><td>Minutes included</td><td>--</td><td>--</td><td>300</td><td>600</td></tr>
                  <tr><td>Lesson scenarios</td><td>--</td><td>--</td><td>Yes</td><td>Yes</td></tr>
                  <tr><td>Collections</td><td>--</td><td>--</td><td>No</td><td>Yes</td></tr>
                </tbody>
              </table>
            </div>

            <button type="button" className="mobile-plans-got-it" onClick={() => setIsMobilePlansOpen(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}

      {showComparePopup && <ComparePlansPopup onClose={() => setShowComparePopup(false)} />}
    </div>
  );
};

export default LandingPage;
