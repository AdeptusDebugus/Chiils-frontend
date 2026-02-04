import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';

// Utility function to properly decode JWT with UTF-8 support
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return {};
  }
};

const LoginSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true
    const handleLoginSuccess = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setError('No token received from server');
          setIsProcessing(false);
          return;
        }

        // Decode JWT to get user info (you might want to verify the token on backend)
        const tokenPayload = decodeJWT(token);
        console.log('JWT Payload:', tokenPayload); // Debug log

        // Handle different JWT formats and field names
        const userData = {
          id: tokenPayload.user_id || tokenPayload.sub || tokenPayload.id || tokenPayload.email,
          email: tokenPayload.email || tokenPayload.emailAddress,
          name: tokenPayload.name || tokenPayload.given_name || tokenPayload.full_name || tokenPayload.username || 'Unknown User',
          picture: tokenPayload.picture || tokenPayload.avatar || tokenPayload.profile_image,
          role: tokenPayload.role || tokenPayload.UserRole || tokenPayload.roles?.[0] || 'USER'
        };

        console.log('Processed user data:', userData); // Debug log

        // Store token and user data
        login(token, userData);

        // Redirect to home dashboard
        navigate('/home', { replace: true });

      } catch (err) {
        console.error('Error processing login:', err);
        setError('Failed to process login. Please try again.');
        setIsProcessing(false);
      }
    };

    handleLoginSuccess();
  }, [searchParams, navigate, login]);

  if (isProcessing) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '20px'
      }}>
        <div>Processing your login...</div>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '20px'
      }}>
        <div style={{ color: 'red' }}>{error}</div>
        <button onClick={() => navigate('/login')}>
          Back to Login
        </button>
      </div>
    );
  }

  return null;
};

export default LoginSuccess;
