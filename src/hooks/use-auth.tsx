import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {authLogin, getCurrentUser} from '../lib/api';
import {clearStoredAccessToken, getStoredAccessToken, setStoredAccessToken} from '../lib/auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: Readonly<{children: React.ReactNode}>) {
  const [token, setToken] = useState<string | null>(() => getStoredAccessToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  const loadMe = async () => {
    if (!token) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    try {
      const me = await getCurrentUser();
      setUser(me);
    } catch (error) {
      console.error('[auth:me]', error);
      clearStoredAccessToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMe();
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login: async (email: string, password: string) => {
        setIsLoading(true);
        try {
          const result = await authLogin(email, password);
          setStoredAccessToken(result.accessToken);
          setToken(result.accessToken);
          setUser(result.user);
        } finally {
          setIsLoading(false);
        }
      },
      logout: () => {
        clearStoredAccessToken();
        setToken(null);
        setUser(null);
      },
      refreshUser: async () => {
        await loadMe();
      },
    }),
    [isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
