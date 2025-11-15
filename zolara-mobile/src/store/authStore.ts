// src/store/authStore.ts
import * as device from "expo-device";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { axiosPublicInstance } from "../lib/axios";
import { socketManager } from "../lib/socket";
import { getUserData, getUserInfo } from "../services/user-service";
import { User, UserData, UserInfo } from "../types";

interface AuthState {
  user: User | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean | null;
  loading: boolean;
  registrationId: string | null;
  resetId: string | null;
  userData: UserData | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  initiateRegistration: (email?: string, phoneNumber?: string) => Promise<void>;
  verifyRegistration: (otp: string) => Promise<void>;
  completeRegistration: (params: {
    password: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
  forgotPassword: (identifier: string) => Promise<void>;
  verifyForgotPassword: (otp: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
}

// Use a default API URL if the environment variable is not available
const BASE_API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.bondhub.cloud/api/v1";
const API_URL = BASE_API_URL + "/auth";

// Log the API URL being used
console.log("Using API URL:", BASE_API_URL);

export const useAuthStore = create<AuthState & AuthActions>((set, get) => {
  // Initialize the auth state
  const initializeAuth = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      if (accessToken) {
        const userStr = await SecureStore.getItemAsync("user");
        const userInfoStr = await SecureStore.getItemAsync("userInfo");
        const userDataStr = await SecureStore.getItemAsync("userData");

        if (userStr) {
          const user = JSON.parse(userStr);
          const userData = userDataStr ? JSON.parse(userDataStr) : null;
          const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
          set({ isAuthenticated: true, user, userInfo, loading: false });
          if ((!userInfo || !userData) && user) {
            get().fetchUserInfo();
          }
          return;
        }
      }
      set({
        isAuthenticated: false,
        user: null,
        userInfo: null,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      set({
        isAuthenticated: false,
        user: null,
        userInfo: null,
        loading: false,
      });
    }
  };

  // Call initialize function when store is created
  initializeAuth();

  return {
    user: null,
    userInfo: null,
    isAuthenticated: null,
    loading: true,
    registrationId: null,
    resetId: null,
    userData: null,

    fetchUserInfo: async () => {
      const { user } = get();
      if (!user) return;

      try {
        const userInfoData = await getUserInfo(user.userId);
        const userDataResponse = await getUserData(user.userId);
        await SecureStore.setItemAsync(
          "userData",
          JSON.stringify(userDataResponse),
        );
        await SecureStore.setItemAsync(
          "userInfo",
          JSON.stringify(userInfoData),
        );
        // Cập nhật state riêng biệt
        set({ userData: userDataResponse });
        set({ userInfo: userInfoData });
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    },

    // Login function
    login: async (identifier: string, password: string) => {
      try {
        const deviceName = device.modelName || "UNKNOWN";
        const deviceTypeS = device.deviceType;
        let deviceType = "";
        switch (deviceTypeS) {
          case 0:
            deviceType = "WEB";
            break;
          case 1:
            deviceType = "MOBILE";
            break;
          case 2:
            deviceType = "TABLET";
            break;
          default:
            deviceType = "WEB";
            break;
        }

        // Kiểm tra xem identifier là email hay số điện thoại
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhoneNumber = /^\+?[0-9]{10,}$/.test(
          identifier.replace(/[\s-]/g, ""),
        );

        if (!isEmail && !isPhoneNumber) {
          throw new Error("Vui lòng nhập email hoặc số điện thoại hợp lệ");
        }
        const response = await axiosPublicInstance.post(`${API_URL}/login`, {
          ...(isEmail ? { email: identifier } : { phoneNumber: identifier }),
          password,
          deviceName,
          deviceType,
        });
        const { accessToken, refreshToken, user, deviceId } = response.data;

        // Store authentication data
        await SecureStore.setItemAsync("accessToken", accessToken);
        await SecureStore.setItemAsync("refreshToken", refreshToken);
        await SecureStore.setItemAsync("user", JSON.stringify(user));
        await SecureStore.setItemAsync("deviceId", deviceId);

        // Update state
        set({ user, isAuthenticated: true });

        // Connect to socket with retry mechanism
        try {
          console.log("Attempting to connect to socket after login");
          await socketManager.connect();
          console.log("Socket connection successful after login");
        } catch (socketError) {
          console.error(
            "Failed to connect to socket after login:",
            socketError,
          );
          // Continue even if socket connection fails - don't block the login flow
        }

        // Fetch user info
        get().fetchUserInfo();
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },

    // Step 1: Initiate Registration
    initiateRegistration: async (email?: string, phoneNumber?: string) => {
      try {
        const response = await axiosPublicInstance.post(
          `${API_URL}/register/initiate`,
          { email, phoneNumber },
        );
        const { registrationId } = response.data;
        set({ registrationId });
      } catch (error) {
        console.error("Registration initiation failed:", error);
        throw error;
      }
    },

    // Step 2: Verify OTP
    verifyRegistration: async (otp: string) => {
      try {
        const registrationId = get().registrationId;
        if (!registrationId) {
          throw new Error("Registration ID not found");
        }
        await axiosPublicInstance.post(`${API_URL}/register/verify`, {
          otp,
          registrationId,
        });
      } catch (error) {
        console.error("OTP verification failed:", error);
        throw error;
      }
    },

    // Step 3: Complete Registration
    completeRegistration: async (params) => {
      try {
        const registrationId = get().registrationId;
        if (!registrationId) {
          throw new Error("Registration ID not found");
        }
        const response = await axiosPublicInstance.post(
          `${API_URL}/register/complete`,
          {
            ...params,
            registrationId,
          },
        );
        const { user } = response.data;
        set({ registrationId: null, user });
      } catch (error) {
        console.error("Registration completion failed:", error);
        throw error;
      }
    },

    // Forgot password
    forgotPassword: async (identifier: string) => {
      try {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhoneNumber = /^\+?[0-9]{10,}$/.test(
          identifier.replace(/[\s-]/g, ""),
        );

        if (!isEmail && !isPhoneNumber) {
          throw new Error("Vui lòng nhập email hoặc số điện thoại hợp lệ");
        }

        const response = await axiosPublicInstance.post(
          `${API_URL}/forgot-password`,
          {
            ...(isEmail ? { email: identifier } : { phoneNumber: identifier }),
          },
        );
        const { resetId } = response.data;
        set({ resetId });
      } catch (error) {
        console.error("Forgot password request failed:", error);
        throw error;
      }
    },

    // Verify forgot password OTP
    verifyForgotPassword: async (otp: string) => {
      try {
        const resetId = get().resetId;
        if (!resetId) {
          throw new Error("Reset ID not found");
        }
        await axiosPublicInstance.post(`${API_URL}/forgot-password/verify`, {
          resetId,
          otp,
        });
      } catch (error) {
        console.error("OTP verification failed:", error);
        throw error;
      }
    },
    
    resetPassword: async (newPassword: string) => {
      try {
        const resetId = get().resetId;
        if (!resetId) {
          throw new Error("Reset ID not found");
        }
        await axiosPublicInstance.post(`${API_URL}/forgot-password/reset`, {
          resetId,
          newPassword,
        });
      } catch (error) {
        console.error("Reset password failed:", error);
        throw error;
      }
    },

    // Logout function
    logout: async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        const accessToken = await SecureStore.getItemAsync("accessToken");
        const deviceId = await SecureStore.getItemAsync("deviceId");

        if (refreshToken && accessToken) {
          try {
            await axiosPublicInstance.post(
              `${API_URL}/logout`,
              {
                refreshToken,
                deviceId,
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            );
          } catch (error) {
            // console.error("Logout API error:", error);
          }
        }
      } catch (error) {
        // console.error("Logout error:", error);
      } finally {
        // Always clean up local storage and state
        await Promise.all([
          SecureStore.deleteItemAsync("accessToken"),
          SecureStore.deleteItemAsync("refreshToken"),
          SecureStore.deleteItemAsync("user"),
          SecureStore.deleteItemAsync("userInfo"),
          SecureStore.deleteItemAsync("deviceId"),
        ]);

        socketManager.disconnect();
        set({ user: null, userInfo: null, isAuthenticated: false });
        router.replace("/(screens)/(auth)/welcome");
      }
    },
  };
});
