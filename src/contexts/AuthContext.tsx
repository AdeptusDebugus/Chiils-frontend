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
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/user/me`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (response.ok) {
        const fullProfile = await response.json();
        console.log("Fetched full profile:", fullProfile);
        setUser(prev => ({ ...prev, ...fullProfile }));
        localStorage.setItem('user_data', JSON.stringify(fullProfile));
      } else {
        console.warn("Failed to fetch user profile:", response.status);
        // If 401/403, might consider logging out, but be careful of loops
      }
    } catch (err) {
      console.error("Error fetching user profile", err);
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

  const login = (newToken: string, userData: User) => {
    console.log('Storing user data:', userData); // Debug log
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    // Immediately fetch full profile
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
