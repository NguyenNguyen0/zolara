import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { logout } = useAuthStore();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync("accessToken");
        if (!accessToken) {
          setIsAuthenticated(false);
          return;
        }
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        const deviceId = await SecureStore.getItemAsync("deviceId");
        try {
          await axiosInstance.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
            {
              refreshToken,
              deviceId,
            },
          );
          setIsAuthenticated(true);
        } catch (error: any) {
          if (error?.response?.status === 401) {
            // Token không hợp lệ, tự động logout
            await logout();
          }
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return isAuthenticated;
};
