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
const imgFAQProfile5 = "/assets/home/portrait-5.png";
const imgJoyfulWomanPortrait = "/assets/home/cta-background.png";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

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
      <div className="hero-section">
        <div className="hero-background">
          <img src={imgHeroImage} alt="Hero" className="hero-image" />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="header" data-name="Header">
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
          <div className="hero-text-block">
             <div className="hero-title-row">
                <h1 className="hero-title">
                  Teach real language.<br />No busywork.
                </h1>
                <div className="hero-subtitle-lines">
                  <p className="hero-subtitle-line">Turn any video into a ready-to-teach lesson</p>
                  <p className="hero-subtitle-line">in a couple of clicks.</p>
                    </div>
                </div>
            </div>
            <div className="hero-buttons">
              <button className="first-lesson-btn" onClick={handleLessonBuilder}>Create your first lesson free</button>
              <button className="community-lessons-btn" onClick={handleOpenLib}>See 500+ community lessons</button>
            </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="features-cards-section" id="about">

        {/* Video Demo Placeholder */}
        <div className="video-demo-placeholder">
          <p className="video-demo-text">Product Demo Video</p>
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
            <button className="create-first-lesson-btn" onClick={handleSignUp}>
              Create your first lesson
            </button>
            <div className="feature-icon-wrapper">
              <img src="/assets/home/feature-card-large.svg" alt="Feature icon" className="feature-icon-img-large" />
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="tools-section" id="tools">
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
              <p>Product Screenshot Placeholder</p>
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
              <p>Product Screenshot Placeholder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section" id="pricing">
        <div className="pricing-background">
          <img src={imgPricingBackground} alt="Pricing Background" />
        </div>
        <div className="pricing-content">
          <div className="pricing-header">
              <h2 className="pricing-title">Plans that keep the thrill alive.</h2>
              <p className="pricing-text">
                  Minutes are counted by actual video length. 1 minute of video = 1 minute used.
                  <br/>
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
                <li>300  minutes / month of YouTube content included</li>
                <li>7-day free trial</li>
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
                <li>Access to the Open Library</li>
                <li>Lesson Builder for creating your own lessons</li>
                <li>600  minutes / month of YouTube content included</li>
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
                <li>800  minutes / month of YouTube content included</li>
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
        </div>

        <div className="cta-bottom-bar">
          <div className="cta-bar-inner">
            <div className="cta-text-group">
              <p>Start teaching smarter today.</p>
              <p>Your first lesson is free.</p>
              <button className="cta-button" onClick={handleSignUp}>Create your first lesson</button>
            </div>

          </div>
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