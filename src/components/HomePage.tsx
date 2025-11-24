import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import Footer from './Footer';

//IMAGES
const imgHeroImage = "/assets/home/about-hero-human.png";
const imgChiilsLogo = "/assets/chiils-white-logo.svg";
const imgFeatureCardSmall1 = "/assets/home/feature-card-small-1.svg";
const imgFeatureCardSmall2 = "/assets/home/feature-card-small-2.svg";
const imgToolCardOpenLibrary = "/assets/home/open-libriary.svg";
const imgToolCardLessonBuilder = "/assets/home/lesson-builder.svg";
const imgStayTunedCard = "/assets/home/for-more.svg";
const imgPricingBackground = "/assets/home/pricing-background.png";
const imgFAQProfile1 = "/assets/home/portrait-1.png";
const imgFAQProfile2 = "/assets/home/portrait-2.png";
const imgFAQProfile3 = "/assets/home/portrait-3.png";
const imgFAQProfile4 = "/assets/home/portrait-4.png";
const imgJoyfulWomanPortrait = "/assets/home/cta-background.png";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/login');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="home-page" data-name="Public Space">
      {/* Navigation Header - Matching Figma Design */}
      <div className="header" data-name="Header">
        {/* Logo */}
        <div className="header-logo" data-name="Logo">
          <img alt="Chiils" src={imgChiilsLogo} className="logo-chiils-img" />
        </div>

        {/* Navigation Links */}
        <a href="#about" className="nav-link nav-about">About</a>
        <a href="#tools" className="nav-link nav-tools">Tools</a>
        <a href="#pricing" className="nav-link nav-pricing">Pricing</a>

        {/* Sign up Button */}
        <div className="header-sign-up" data-name="Sign up">
          <button className="sign-up-btn" onClick={handleSignUp}>Sign up</button>
        </div>

        {/* Sign in Button */}
        <div className="header-sign-in" data-name="Sign in">
          <button className="sign-in-btn" onClick={handleSignIn}>Sign in</button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <img src={imgHeroImage} alt="Hero" className="hero-image" />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-bottom-container">
            <div className="hero-text-block">
              <div className="hero-title-row">
                <h1 className="hero-title">
                  Language is a thrill,<br />
                  <span className="hero-title-second-line">
                    not a drill
                    <div className="hero-subtitle-lines">
                      <p className="hero-subtitle-line">Create personalised lessons in minutes and keep</p>
                      <p className="hero-subtitle-line">your students engaged</p>
                    </div>
                  </span>
                </h1>
              </div>
            </div>
            <button className="hero-cta" onClick={handleSignUp}>Start for free</button>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="features-cards-section" id="about">
        <div className="features-cards-container">
          <div className="features-cards-row">
            <div className="feature-card-small">
              <h3 className="feature-card-title">Create personalised lessons in minutes</h3>
              <div className="feature-card-divider"></div>
              <p className="feature-card-text">Turn any Youtube video or podcast into a structured lesson with grammar and vocabulary practice.</p>
              <div className="feature-icon-wrapper">
                <img src={imgFeatureCardSmall1} alt="Feature icon" className="feature-icon-img" />
              </div>
            </div>

            <div className="feature-card-small">
              <h3 className="feature-card-title">Keep your students engaged and motivated</h3>
              <div className="feature-card-divider"></div>
              <p className="feature-card-text">Use authentic content that matches their interests, level and goals.</p>
              <div className="feature-icon-wrapper">
                <img src={imgFeatureCardSmall2} alt="Feature icon" className="feature-icon-img" />
              </div>
            </div>
          </div>

          {/* About Content */}
          <div className="about-content">
            <div className="about-content-wrapper">
              <h2 className="section-title">
                Focus on teaching<br />
                — we handle the prep
              </h2>
              <div className="about-text-container">
                <p className="about-text">
                  Chiils is an AI partner and platform that helps freelance language teachers save time, stay inspired, and keep students engaged.
                </p>
                <p className="about-text">
                  We turn hours of preparation into minutes — so you can focus on what truly matters: creating meaningful lessons and keeping your students motivated. Because language is a thrill — and teaching it should feel that way too.
                </p>
                <p className="about-text">
                  We believe language teaching isn't just about grammar or structure — it's about meaning, connection, and discovery. Chiils helps teachers stay creative, motivated, and efficient, so every lesson feels alive and rewarding.
                </p>
              </div>
              <button className="create-first-lesson" onClick={handleSignUp}>
                Create your first lesson
              </button>
            </div>
          </div>
        </div>

        <div className="feature-card-large">
          <h3 className="feature-card-title">Stand out from other educators</h3>
          <div className="feature-card-divider"></div>
          <p className="feature-card-text">
            Every teacher has a style — but competition keeps growing.
            <br />
            Chiils offers you a modern tool to teach smarter, stay current, and show your students what real language learning feels like.
          </p>
          <div className="feature-icon-wrapper">
            <img src="/assets/home/feature-card-large.svg" alt="Feature icon" className="feature-icon-img-large" />
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="tools-section" id="tools">
        <div className="tools-top-container">
          <div className="tools-text-group">
            <h2 className="section-title">Keep the spark for languages alive with our tools</h2>
            <p className="section-description">
              We build tools that take care of the prep, so you can focus on what makes teaching exciting — connection, curiosity, and real communication. Keep your students inspired too. Let them feel your passion for language.
            </p>
          </div>

          <div className="tools-cards-group">
            <div className="tool-card">
              <h3>Open Library</h3>
              <div className="tool-card-divider"></div>
              <ul className="tool-features">
                <li>Explore ready-to-use lessons created by other users</li>
                <li>Use tags to filter them by target language, level, topic, or speaking style to fit your students' goals</li>
                <li>Search by grammar topics</li>
                <li>Stay tuned — the library keeps growing</li>
              </ul>
              <button className="explore-btn">Explore</button>
              <div className="tool-icon-wrapper">
                <img src={imgToolCardOpenLibrary} alt="Open Library icon" className="tool-icon-img" />
              </div>
            </div>

            <div className="tool-card">
              <h3>Lesson Builder</h3>
              <ul className="tool-features">
                <li>Create custom lessons from any YouTube video or podcast in minutes</li>
                <li>Tailor each one to your students' level, goals, and interests</li>
                <li>Request up to 3 custom grammar topics per lesson</li>
                <li>Save hours on prep and focus on what really inspires you to teach</li>
              </ul>
              <button className="explore-btn">Explore</button>
              <div className="tool-icon-wrapper">
                <img src={imgToolCardLessonBuilder} alt="Lesson Builder icon" className="tool-icon-img" />
              </div>
            </div>
          </div>
        </div>

        <div className="stay-tuned-card">
          <h3>Stay tuned for more</h3>
          <div className="stay-tuned-card-divider"></div>
          <p>We're always building new tools to make<br />
            teaching feel even more inspiring and<br />
            effortless. Stay tuned — there's more<br />
            coming soon.</p>
          <div className="tool-icon-wrapper">
            <img src={imgStayTunedCard} alt="Stay tuned icon" className="tool-icon-img" />
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="video-section">
        <div className="video-placeholder">
          <p className="video-label">VIDEO SCREENCAST</p>
        </div>
        <div className="video-info">
          <h2 className="video-title">From link to lesson — in minutes</h2>
          <p className="video-description">
            See a quick walkthrough of the Open Library and Lesson Builder. Discover how easy it is to find lessons or turn any video into one of your own.
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section" id="pricing">
        <div className="pricing-background">
          <img src={imgPricingBackground} alt="Pricing Background" />
        </div>
        <div className="pricing-content">
          <h2 className="pricing-title">Comfortable subscription plans<br />to keep you inspired</h2>
          <div className="pricing-cards">
            {/* Open Library Card */}
            <div className="pricing-card">
              <h3>Open Library</h3>
              <div className="pricing-divider"></div>
              <p className="price">€5<span>/ month</span></p>
              <ul className="price-features">
                <li>Full access to the Open Library</li>
                <li>Ready-made lessons curated by Chiils community</li>
                <li>Interactive exercises included in each lesson</li>
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
                <li>Access to the Open Library</li>
                <li>Lesson Builder for creating your own lessons</li>
                <li>300 minutes of YouTube content included</li>
                <li>7-day free trial</li>
              </ul>
              <button className="get-started-btn" onClick={handleSignUp}>
                <span className="btn-text">Start for free</span>
              </button>
            </div>

            {/* Plus Card */}
            <div className="pricing-card">
              <h3>Plus</h3>
              <div className="pricing-divider"></div>
              <p className="price">€20<span>/ month</span></p>
              <ul className="price-features">
                <li>Access to the Open Library</li>
                <li>Lesson Builder for creating your own lessons</li>
                <li>600 minutes of YouTube content included</li>
                <li>7-day free trial</li>
              </ul>
              <button className="get-started-btn" onClick={handleSignUp}>
                <span className="btn-text">Start for free</span>
              </button>
            </div>

            {/* Pro Card */}
            <div className="pricing-card">
              <h3>Pro</h3>
              <div className="pricing-divider"></div>
              <p className="price">€30<span>/ month</span></p>
              <ul className="price-features">
                <li>Access to the Open Library</li>
                <li>Lesson Builder for creating your own lessons</li>
                <li>800 minutes of YouTube content included</li>
                <li>7 days free trial</li>
              </ul>
              <button className="get-started-btn" onClick={handleSignUp}>
                <span className="btn-text">Start for free</span>
              </button>
            </div>
          </div>
          <button className="compare-plan-btn">Compare plans →</button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="faq-section-header">
          <div className="faq-section-left">
            <h2 className="section-title">Answers for the
              <br />
              curious</h2>
            <p className="faq-intro">
              Here are some answers to frequently asked questions that might help you get started.
              <br />
              <br />
              If you don't find what you're looking for, just email us at team@chiils.com
              <br />
              — we'll be happy to help.
            </p>
          </div>
          <div className="faq-grid">
            <div className="faq-card">
              <div className="faq-profile-image">
                <img src={imgFAQProfile1} alt="Profile" />
              </div>
              <div className="faq-content">
                <h3>Do I need to know how to use AI tools?</h3>
                <div className="faq-answer">
                  <p>Not at all. Chiils was built to make AI feel invisible, you just bring the content, and we handle the rest.</p>
                </div>
              </div>
            </div>
            <div className="faq-card">
              <div className="faq-profile-image">
                <img src={imgFAQProfile2} alt="Profile" />
              </div>
              <div className="faq-content">
                <h3>Are there any limits or rules I should know about?</h3>
                <div className="faq-answer">
                  <p>Only a few. Chiils supports public YouTube videos and podcasts shorter than 120 minutes. We don't support private links, everything else is wide open.</p>
                </div>
              </div>
            </div>
            <div className="faq-card">
              <div className="faq-profile-image">
                <img src={imgFAQProfile3} alt="Profile" />
              </div>
              <div className="faq-content">
                <h3>How long does it take to create a custom lesson?</h3>
                <div className="faq-answer">
                  <p>It depends on the length of your video. Usually, it takes around 5–10 minutes, but longer videos (30+ minutes) might require more time.</p>
                </div>
              </div>
            </div>
            <div className="faq-card">
              <div className="faq-profile-image">
                <img src={imgFAQProfile4} alt="Profile" />
              </div>
              <div className="faq-content">
                <h3>Can I use any video or podcast to create a lesson?</h3>
                <div className="faq-answer">
                  <p>At the moment, Chiils supports public YouTube videos only. We don't host or upload content — you just need a link to create your lesson.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-background">
          <img src={imgJoyfulWomanPortrait} alt="Background" />
        </div>
        <div className="cta-content">
          <h2 className="cta-title">Language is a thrill
            <br />
            — and teaching it should
            <br />
            feel that way too</h2>
          <p className="cta-description">
            Turn real content into ready-to-teach lessons and focus on what you love. Ready to join the community?
          </p>
          <button className="cta-button" onClick={handleSignUp}>Start for free →</button>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;