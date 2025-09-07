import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Real Talk</h1>
        <p className="hero-subtitle">Learn English through engaging podcast-based lessons</p>
        <div className="cta-buttons">
          <Link to="/lesson/1" className="cta-button primary">
            Start Learning
          </Link>
          <Link to="/order" className="cta-button secondary">
            Order Lessons
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose Real Talk?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎧</div>
            <h3>Podcast-Based Learning</h3>
            <p>Learn from real conversations and authentic English content</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Interactive Exercises</h3>
            <p>Practice with vocabulary exercises and comprehension questions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Real-World Context</h3>
            <p>Understand how English is used in everyday situations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

