import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { mockAdminUser, mockApiDelay } from '../services/mockData';
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
    // Check for existing authentication token on app start
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('Restored user session:', parsedUser.email);
        } catch (err) {
          console.error('Failed to parse stored user data:', err);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }

      setIsInitialized(true);
    };

    checkExistingAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await mockApiDelay(1000);

      // Mock authentication - in real app, this would be an API call
      if (email === mockAdminUser.email && password === 'admin123') {
        const userData = {
          id: mockAdminUser.id,
          email: mockAdminUser.email,
          displayName: mockAdminUser.displayName,
          role: mockAdminUser.role,
        };

        // Store auth token and user data
        localStorage.setItem('auth_token', mockAdminUser.token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        console.log('Login successful:', userData.email);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);

      let errorMessage = 'Failed to login. Please try again.';
      const error = err as { message?: string };

      if (error.message === 'Invalid credentials') {
        errorMessage = 'Invalid email or password.';
      } else {
        errorMessage = error.message || 'An error occurred during login.';
      }

      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await mockApiDelay(500);

      // Clear stored data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      setUser(null);
      console.log('Logout successful');
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Logout error:', err);
      setError(error.message || 'Failed to logout. Please try again.');
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
