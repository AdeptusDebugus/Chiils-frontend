import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, logout, token } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e9e9e7'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#37352f',
          margin: 0 
        }}>
          Profile & Authorization
        </h1>
        <button
          onClick={handleLogout}
          style={{
            background: '#37352f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ 
        background: '#f7f6f3', 
        border: '1px solid #e9e9e7',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#37352f',
          margin: '0 0 16px 0'
        }}>
          Account Information
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          {user?.picture && (
            <img 
              src={user.picture} 
              alt="Profile" 
              style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
          )}
          <div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#37352f',
              marginBottom: '4px'
            }}>
              {user?.name || 'Unknown User'}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#787774' 
            }}>
              {user?.email || 'No email provided'}
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#787774',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              User ID
            </label>
            <div style={{ 
              fontSize: '14px', 
              color: '#37352f',
              fontFamily: 'monospace',
              background: '#ffffff',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #e9e9e7'
            }}>
              {user?.id || 'N/A'}
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#787774',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Authentication Status
            </label>
            <div style={{ 
              fontSize: '14px', 
              color: '#27ae60',
              fontWeight: '500'
            }}>
              ✓ Authenticated
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        background: '#f7f6f3', 
        border: '1px solid #e9e9e7',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#37352f',
          margin: '0 0 16px 0'
        }}>
          Session Information
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#787774',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Token Status
            </label>
            <div style={{ 
              fontSize: '14px', 
              color: token ? '#27ae60' : '#e74c3c',
              fontWeight: '500'
            }}>
              {token ? '✓ Active' : '✗ Missing'}
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#787774',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Login Method
            </label>
            <div style={{ 
              fontSize: '14px', 
              color: '#37352f',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google OAuth2
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <div style={{ 
          fontSize: '14px', 
          color: '#856404',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <span>⚠️</span>
          <div>
            <strong>Security Note:</strong> Your session is stored locally in your browser. 
            Make sure to logout when using a shared computer.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
