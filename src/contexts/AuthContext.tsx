import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: string;
  plan?: string;
  lesson_builder_minutes?: number;
  permissions?: {
    can_access_library: boolean;
    can_use_builder: boolean;
    can_use_collections: boolean;
    can_use_scenarios: boolean;
  };
  paddle_customer_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (jwt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/user/me`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (response.ok) {
        const fullProfile = await response.json();
        setUser(prev => ({ ...prev, ...fullProfile }));
        localStorage.setItem('user_data', JSON.stringify(fullProfile));
      } else {
        console.warn("Failed to fetch user profile:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user_data');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) { /* ignore */ }
      }
      // Always refresh from API to get latest permissions
      fetchUserProfile(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handlePaddleCheckoutCompleted = () => {
      setTimeout(() => {
        if (token) {
          fetchUserProfile(token);
        }
      }, 4000);
    };

    window.addEventListener('paddle-checkout-completed', handlePaddleCheckoutCompleted as EventListener);

    return () => {
      window.removeEventListener('paddle-checkout-completed', handlePaddleCheckoutCompleted as EventListener);
    };
  }, [token]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    // Immediately fetch full profile and it will handle setting isLoading to false
    fetchUserProfile(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      refreshProfile: () => token ? fetchUserProfile(token) : Promise.resolve(),
      isAuthenticated,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
