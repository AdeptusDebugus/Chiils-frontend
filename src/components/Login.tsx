import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Redirect to your Spring Boot OAuth2 endpoint
    // Ensure HTTPS when the site is served over HTTPS to avoid mixed content
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
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        width: '100%',
        gap: '30px',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        boxSizing: 'border-box',
        margin: 0
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '600', 
            color: '#37352f',
            marginBottom: '8px'
          }}>
            Welcome back to Chiils
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#787774',
            marginBottom: '30px'
          }}>
            You are already logged in
          </p>
        </div>

        {/* User Info Card */}
        <div style={{ 
          background: '#f7f6f3',
          border: '1px solid #e9e9e7',
          borderRadius: '12px',
          padding: '24px',
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {user.picture ? (
              <img 
                src={user.picture} 
                alt="Profile" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
            ) : (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#37352f',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '600'
              }}>
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#37352f',
            marginBottom: '4px'
          }}>
            {user.name || 'Unknown User'}
          </h2>
          
          <p style={{ 
            fontSize: '14px', 
            color: '#787774',
            marginBottom: '20px'
          }}>
            {user.email || 'No email provided'}
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleGoToProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#37352f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              View Profile
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: '#787774',
                border: '1px solid #e9e9e7',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show login form for unauthenticated users
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      width: '100%',
      gap: '20px',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
      boxSizing: 'border-box',
      margin: 0
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          color: '#37352f',
          marginBottom: '8px'
        }}>
          Welcome to Chiils
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#787774',
          marginBottom: '30px'
        }}>
          Sign in to continue to your personalized language learning experience
        </p>
      </div>
      
      <button
        onClick={handleGoogleLogin}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 28px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          boxShadow: '0 2px 4px rgba(66, 133, 244, 0.2)',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3367d6'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4285f4'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p
        style={{
          marginTop: '8px',
          fontSize: '16px',
          color: '#787774',
          textAlign: 'center',
          maxWidth: '360px',
          lineHeight: 1.6
        }}
      >
        By continuing with Google, you agree to our{' '}
        <Link to="/termsofservice" style={{ color: '#787774', textDecoration: 'none' }}>
          Terms &amp; Conditions
        </Link>{' '}
        and{' '}
        <Link to="/privacypolicy" style={{ color: '#787774', textDecoration: 'none' }}>
          Privacy Policy
        </Link>.
      </p>
    </div>
  );
};

export default Login;
