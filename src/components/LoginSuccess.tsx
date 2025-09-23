import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
        let tokenPayload: any = {}
        try {
          tokenPayload = JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
          // If decoding fails, still proceed to store token and go to dashboard
          tokenPayload = {}
        }
        
        const userData = {
          id: tokenPayload.sub || tokenPayload.id,
          email: tokenPayload.email,
          name: tokenPayload.name,
          picture: tokenPayload.picture
        };

        // Store token and user data
        login(token, userData);
        
        // Redirect to My Lessons or intended page
        navigate('/my-lessons', { replace: true });
        
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
