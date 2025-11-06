import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { FirebaseAuthService } from '../services/authService';
import { AnalyticsService } from '../services/analyticsService';
import { AuthContext, type User, type AuthContextType } from './AuthContextType';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Admin User',
          role: firebaseUser.role,
        };
        setUser(userData);
        console.log('User authenticated:', userData.email);
      } else {
        setUser(null);
        console.log('User logged out');
      }
      setIsInitialized(true);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const firebaseUser = await FirebaseAuthService.signIn(email, password);

      // Log analytics event
      AnalyticsService.logAdminLogin('email');

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Admin User',
        role: firebaseUser.role,
      };

      setUser(userData);
      console.log('Login successful:', userData.email);
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as Error;
      setError(error.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await FirebaseAuthService.signOut();

      // Log analytics event
      AnalyticsService.logAdminLogout();

      setUser(null);
      console.log('Logout successful');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Logout error:', err);
      setError(error.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
