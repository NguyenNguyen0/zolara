import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { apiService } from "../services/api";
import { AxiosError } from "axios";
import { AuthContext } from "./AuthContext.context";
import type {
  User,
  LoginCredentials,
  AuthResponse,
  AuthContextType,
} from "./AuthContext.types";

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);

          // Verify admin status with server
          try {
            const adminResponse = await apiService.verifyAdmin();
            const adminData = adminResponse.data;

            if (!adminData.isAdmin) {
              throw new Error("Admin access required");
            }

            // Update user data with server response
            const updatedUser = {
              ...userData,
              ...adminData,
              id: adminData.userId,
            };

            setUser(updatedUser);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (adminErr) {
            console.error("Admin verification failed:", adminErr);
            setError(
              "Admin access required. Please contact your administrator."
            );
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            localStorage.removeItem("refreshToken");
          }
        } catch (err) {
          console.error("Failed to parse user data:", err);
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          localStorage.removeItem("refreshToken");
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
        deviceType: credentials.deviceType || "WEB",
        deviceName: credentials.deviceName || "Zolara Admin Dashboard",
      };

      const response = await apiService.login(loginData);
      const data: AuthResponse = response.data;

      // Store tokens temporarily
      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Verify admin status before completing login
      try {
        const adminResponse = await apiService.verifyAdmin();
        const adminData = adminResponse.data;

        if (!adminData.isAdmin) {
          // Clear stored tokens if not admin
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          setError(
            "Admin access required. This account does not have administrative privileges."
          );
          setIsLoading(false);
          return false;
        }

        // Merge user data with admin verification data
        const completeUserData = {
          ...data.user,
          ...adminData,
          id: adminData.userId,
        };

        // Store complete user data
        localStorage.setItem("user", JSON.stringify(completeUserData));

        // Update state
        setUser(completeUserData);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true; // Return success
      } catch (adminErr) {
        // Clear stored tokens if admin verification fails
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");

        const axiosError = adminErr as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Admin access required. Please contact your administrator.";
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
      setIsLoading(false);
      return false; // Return failure
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem("refreshToken");
      
      // Call logout API endpoint with refresh token
      await apiService.logout(refreshToken || undefined);
    } catch (err) {
      console.error("Logout API call failed:", err);
      // Continue with logout even if API call fails
    } finally {
      // Clear storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Clear state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Fetch user profile function
  const fetchUserProfile = useCallback(
    async (userId?: string) => {
      try {
        // Use provided userId or extract from current user data
        const targetUserId = userId || user?.id || user?.userId;

        if (!targetUserId) {
          console.error("No user ID available for profile fetch");
          return null;
        }

        const response = await apiService.getUserBasicInfo(targetUserId);
        const userData = response.data;

        // Update user data in state and localStorage
        setUser((prevUser) => {
          if (!prevUser) return null;

          const updatedUser = {
            ...prevUser,
            ...userData,
            // Ensure we keep the correct id field
            id: prevUser.id || prevUser.userId || targetUserId,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return updatedUser as User;
        });

        return userData;
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        return null;
      }
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    error,
    clearError,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
