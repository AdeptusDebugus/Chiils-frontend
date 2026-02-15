import React from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginNotification from './LoginNotification';
import './Login.css';

const Login: React.FC = () => {
  const { login, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hideSignInLink = location.state?.hideSignInLink;

  const handleGoogleLogin = () => {
    const rawBackendUrl = import.meta.env.VITE_API_URL;
    const backendUrl = (typeof window !== 'undefined' && window.location.protocol === 'https:')
      ? rawBackendUrl.replace(/^http:\/\//, 'https://')
      : rawBackendUrl;
    const redirectUri = `${window.location.origin}/login/success`;
    const googleAuthUrl = `${backendUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = googleAuthUrl;
  };

  const handleLogout = () => {
    logout();
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  // If user is already authenticated, show their profile info
  if (isAuthenticated && user) {
    return (
      <div className="login-container">
        <img src="/assets/subscription/chiils-log.svg" alt="Chiils" className="login-logo" />

        <div className="login-card logged-in-card">
          <div className="login-card-header">
            <h1>Welcome back!</h1>
          </div>

          <div className="profile-section">
            <div className="profile-img-container">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt="Profile"
                  className="profile-img"
                />
              ) : (
                <div className="profile-initials">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <h2 className="user-name">{user.name || 'User'}</h2>
            <p className="user-email">{user.email || 'No email provided'}</p>

            <div className="action-buttons">
              <button onClick={handleLogout} className="secondary-btn">
                Logout
              </button>

              <button onClick={handleGoToProfile} className="primary-btn">
                View Profile
              </button>
            </div>
          </div>

          <p className="login-footer-text">
            Logged in as <strong>{user.name}</strong>. Not you? Logout to switch accounts.
          </p>
        </div>
      </div>
    );
  }

  // Show login form for unauthenticated users
  return (
    <div className="login-container">
      <LoginNotification />
      <img src="/assets/subscription/chiils-log.svg" alt="Chiils" className="login-logo" />

      <div className="login-card">
        <div className="login-card-header">
          <h1>Welcome, dear</h1>
        </div>

        <div className="login-form-content">
          <button onClick={handleGoogleLogin} className="google-login-btn">
            <img src="/assets/autorization/google-logo.svg" alt="Google" className="google-icon" />
          </button>

          {!hideSignInLink && (
            <p className="signin-link-text">
              Already have an account? <span onClick={handleGoogleLogin} className="signin-link" style={{ cursor: 'pointer' }}>Sign in.</span>
            </p>
          )}
        </div>

        <p className="login-footer-text">
          By continuing with Google, you agree to our{' '}
          <Link to="/termsofservice">Terms & Conditions</Link>{' '}
          and{' '}
          <Link to="/privacypolicy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default Login;
