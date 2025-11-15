import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import { AxiosError } from 'axios';
import { AuthContext } from './AuthContext.context';
import type { User, LoginCredentials, AuthResponse, AuthContextType } from './AuthContext.types';

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Failed to parse user data:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Add default deviceType for web admin
      const loginData = {
        ...credentials,
        deviceType: credentials.deviceType || 'WEB',
        deviceName: credentials.deviceName || 'Zolara Admin Dashboard'
      };

      const response = await apiService.login(loginData);
      const data: AuthResponse = response.data;

      // Store tokens and user data
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update state
      setUser(data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true; // Return success
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = 
        axiosError.response?.data?.message || 
        'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      setIsLoading(false);
      return false; // Return failure
    }
  };

  // Logout function
  const logout = () => {
    // Clear storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
