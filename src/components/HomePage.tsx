import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import Footer from './Footer';
import ComparePlansPopup from './ComparePlansPopup';

//IMAGES
const imgHeroImage = "/assets/home/about-hero-human.png";
const imgChiilsLogo = "/assets/chiils-white-logo.svg";
const imgFeatureCardSmall1 = "/assets/home/feature-card-small-1.svg";
const imgFeatureCardSmall2 = "/assets/home/feature-card-small-2.svg";
const imgPricingBackground = "/assets/home/pricing-background.png";
const imgFAQProfile1 = "/assets/home/portrait-1.png";
const imgFAQProfile2 = "/assets/home/portrait-2.png";
const imgFAQProfile3 = "/assets/home/portrait-3.png";
const imgFAQProfile4 = "/assets/home/portrait-4.png";
const imgFAQProfile5 = "/assets/home/portrait-5.png";
const imgJoyfulWomanPortrait = "/assets/home/cta-background.png";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showComparePopup, setShowComparePopup] = React.useState(false);

  const handleSignUp = () => {
    navigate('/login');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleOpenLib = () => {
    navigate('/open-library');
  };

  const handleLessonBuilder = () => {
    navigate('/lesson-order');
  };

  return (
    <div className="home-page" data-name="Public Space">
      {/* Navigation Header - Matching Figma Design */}


      {/* Hero Section */}
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

              {/* Navigation Links */}
              <div className="nav-links">
                <a href="#about" className="nav-link nav-about">About</a>
                <a href="#tools" className="nav-link nav-tools">Tools</a>
                <a href="#pricing" className="nav-link nav-pricing">Pricing</a>
              </div>

              <div className="header-buttons">
                <button className="sign-up-btn" onClick={handleSignUp}>Sign up</button>
                <button className="sign-in-btn" onClick={handleSignIn}>Sign in</button>
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
                <p className="hero-subtitle-line">Turn any video into a ready-to-teach lesson</p>
                <p className="hero-subtitle-line">in a couple of clicks.</p>
              </div>
            </div>
            <div className="hero-buttons">
              <button className="first-lesson-btn" onClick={handleLessonBuilder}>Create your first lesson free</button>
              <button className="community-lessons-btn" onClick={handleOpenLib}>See 500+ community lessons</button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="features-cards-section" id="about">
        <div className="main-container">
          {/* Video Demo Placeholder */}
          <div className="video-demo-placeholder">
            <p className="video-demo-text">Video demo coming soon</p>
          </div>

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
                      Create your first lesson
                  </button>
                <img src="/assets/home/feature-card-large.svg" alt="Feature icon" className="feature-icon-img-large" />
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

          <div className="tools-container">
            {/* Open Library Card */}
            <div className="tool-card-large">
              <div className="tool-card-content">
                <h3>Open Library</h3>
                <div className="tool-card-divider"></div>
                <p className="tool-card-description">A growing library of ready-to-use lessons you can teach right away.</p>
                <button className="tool-card-arrow-btn" onClick={handleOpenLib}>
                  →
                </button>
              </div>
              <div className="tool-card-image-placeholder">
                <p>Demo coming soon</p>
              </div>
            </div>

            {/* Lesson Builder Card */}
            <div className="tool-card-large">
              <div className="tool-card-content">
                <h3>Lesson Builder</h3>
                <div className="tool-card-divider"></div>
                <p className="tool-card-description">A video-to-lesson tool for creating custom lessons in a couple of clicks.</p>
                <button className="tool-card-arrow-btn" onClick={handleLessonBuilder}>
                  →
                </button>
              </div>
              <div className="tool-card-image-placeholder">
                <p>Demo coming soon</p>
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
                Start / Plus / Pro plans include a 7-day free trial. Cancel anytime.
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
                    <li>Interactive exercises</li>
                    <li>Interactive flashcards</li>
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
                  <li>7-day free trial</li>
                  <li>Everything in Open Library</li>
                  <li>Lesson Builder for creating your own lessons</li>
                  <li>300 minutes / month of YouTube videos included</li>
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
                  <li>7 days free trial</li>
                  <li>Everything in Start</li>
                  <li>600 minutes / month of YouTube videos included</li>
                  <li>Personal collections</li>
                  <li>2 generation modes</li>
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
                  <li>7 days free trial</li>
                  <li>Everything in Plus</li>
                  <li>800 minutes / month of YouTube content included</li>
                  <li>Student progress</li>
                </ul>
                <button className="get-started-btn" onClick={handleSignUp}>
                  <span className="btn-text">Start for free</span>
                </button>
              </div>
            </div>
            <button className="compare-plan-btn" onClick={() => setShowComparePopup(true)}>Compare plans →</button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
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
              <div className="faq-card">
                <div className="faq-profile-image">
                  <img src={imgFAQProfile5} alt="Profile" />
                </div>
                <div className="faq-content">
                  <h3>How is it different from Chat GPT?</h3>
                  <div className="faq-answer">
                    <p>Chiils delivers a complete, beautifully structured lesson — from engaging lead-in to production — packed with every exercise type you need, perfectly balanced, no prompts required. All that in a couple of clicks. </p>
                  </div>
                </div>
              </div>
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
                  <h3>Can I share my lessons with students?</h3>
                  <div className="faq-answer">
                    <p>Yes! You can instantly share your full lesson with students via a simple public link. No sign-up, no login, no extra steps required.</p>
                  </div>
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

      {showComparePopup && <ComparePlansPopup onClose={() => setShowComparePopup(false)} />}
    </div>
  );
};

export default HomePage;