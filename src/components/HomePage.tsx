import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

// Import images from local assets folder
// These images were extracted from Figma design using MCP tools and downloaded locally
const imgHeroImage = "/assets/9307bd10e88c14ca7ddcf98658faa0c02a9f07ba.png";
const imgWarmAbstractGlow = "/assets/c27f44e18ef91a27d614b8a2243a51b4411e51b6.png";
const imgChiilsLogo = "/assets/chiils-white-logo.svg";
const imgManRelaxingWithLaptop = "/assets/29c825a17f480461ba33a3340904c669b2b2643c.png";
// Profile images for FAQ section (placeholder paths - these need to be added to assets)
const imgFAQProfile1 = "/assets/29c825a17f480461ba33a3340904c669b2b2643c.png"; // Portrait with Green Background 3
const imgFAQProfile2 = "/assets/29c825a17f480461ba33a3340904c669b2b2643c.png"; // Creative Professional at Workspace 1
const imgFAQProfile3 = "/assets/29c825a17f480461ba33a3340904c669b2b2643c.png"; // Creative Professional at Workspace 2
const imgFAQProfile4 = "/assets/29c825a17f480461ba33a3340904c669b2b2643c.png"; // Creative Professional at Workspace 3
const imgJoyfulWomanPortrait = "/assets/29c825a17f480461ba33a3340904c669b2b2643c.png"; // For CTA section

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
      {/* Navigation Header */}
      <div className="header">
        <div className="logo">
          <img alt="Chiils" src={imgChiilsLogo} />
        </div>
        <nav className="nav-menu">
          <a href="#about" className="nav-link">About</a>
          <a href="#tools" className="nav-link">Tools</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </nav>
        <div className="header-buttons">
          <button className="sign-up-btn" onClick={handleSignUp}>Sign up</button>
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
          <h1 className="hero-title">Language is a thrill, not a drill</h1>
          <p className="hero-subtitle">Create personalised lessons in minutes and keep your students engaged</p>
          <button className="hero-cta" onClick={handleSignUp}>Start for free</button>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="features-cards-section">
        <div className="feature-card-small">
          <div className="feature-icon-wrapper">
            <div className="feature-icon">*</div>
          </div>
          <h3 className="feature-card-title">Create personalised lessons in minutes</h3>
          <p className="feature-card-text">Turn any Youtube video or podcast into a structured lesson with grammar and vocabulary practice.</p>
        </div>
        
        <div className="feature-card-small">
          <div className="feature-icon-wrapper">
            <div className="feature-icon">×</div>
          </div>
          <h3 className="feature-card-title">Keep your students engaged and motivated</h3>
          <p className="feature-card-text">Use authentic content that matches their interests, level and goals.</p>
        </div>
        
        <div className="feature-card-large">
          <div className="feature-icon-wrapper">
            <div className="feature-icon-large">□</div>
          </div>
          <h3 className="feature-card-title">Stand out from other educators</h3>
          <p className="feature-card-text">
            Every teacher has a style — but competition keeps growing.
            <br />
            Chiils offers you a modern tool to teach smarter, stay current, and show your students what real language learning feels like.
          </p>
          <button className="check-library-btn" onClick={handleSignUp}>
            Check Open Library →
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section" id="about">
        <div className="about-content">
          <h2 className="section-title">Focus on teaching — we handle the prep</h2>
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
      </div>

      {/* Tools Section */}
      <div className="tools-section" id="tools">
        <h2 className="section-title">Keep the spark for languages alive with our tools</h2>
        <p className="section-description">
          We build tools that take care of the prep, so you can focus on what makes teaching exciting — connection, curiosity, and real communication. Keep your students inspired too. Let them feel your passion for language.
        </p>
        
        <div className="tools-grid">
          <div className="tool-card">
            <h3>Open Library</h3>
            <ul className="tool-features">
              <li>Explore ready-to-use lessons created by other users</li>
              <li>Use tags to filter them by target language, level, topic, or speaking style to fit your students' goals</li>
              <li>Search by grammar topics</li>
              <li>Stay tuned — the library keeps growing</li>
            </ul>
            <button className="explore-btn">Explore</button>
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
          </div>
        </div>

        <div className="stay-tuned-card">
          <h3>Stay tuned for more</h3>
          <p>We're always building new tools to make teaching feel even more inspiring and effortless. Stay tuned — there's more coming soon.</p>
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
          <img src={imgManRelaxingWithLaptop} alt="Background" />
        </div>
        <div className="pricing-content">
          <h2 className="pricing-title">Comfortable subscription plans to keep you inspired</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <h3>Free</h3>
              <p className="price">€0<span>/ month</span></p>
              <ul className="price-features">
                <li>Access to the Open Library of ready-to-use lessons created by other users</li>
              </ul>
              <button className="get-started-btn" onClick={handleSignUp}>Get started</button>
            </div>
            <div className="pricing-card">
              <h3>Smart</h3>
              <p className="price">€25<span>/ month</span></p>
              <ul className="price-features">
                <li>Everything in Free</li>
                <li>Lesson Builder for creating fully custom lessons</li>
                <li>Up to 800 minutes of YouTube content included</li>
                <li>7 days free trial</li>
              </ul>
              <button className="get-started-btn" onClick={handleSignUp}>Get started</button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2 className="section-title">Answers for the curious</h2>
        <p className="faq-intro">
          Here are some answers to frequently asked questions that might help you get started. If you don't find what you're looking for, just email us at team@chiils.com — we'll be happy to help.
        </p>
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

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-background">
          <img src={imgJoyfulWomanPortrait} alt="Background" />
        </div>
        <div className="cta-content">
          <h2 className="cta-title">Language is a thrill — and teaching it should feel that way too</h2>
          <p className="cta-description">
            Turn real content into ready-to-teach lessons and focus on what you love. Ready to join the community?
          </p>
          <button className="cta-button" onClick={handleSignUp}>Start for free</button>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={imgChiilsLogo} alt="Chiils" />
          </div>
          <div className="footer-contact">
            <button className="email-btn">team@chiils.com</button>
          </div>
          <div className="footer-links">
            <a href="#privacy">Privacy policy</a>
            <a href="#terms">Terms & Conditions</a>
            <a href="#refund">Refund policy</a>
            <p>Copyright © Koala Station DOO Beograd, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;