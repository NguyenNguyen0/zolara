import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

// Define interface for custom config
interface CustomApiConfig extends AxiosRequestConfig {
  customHeaders?: Record<string, string>;
}

// Base configuration
class ApiConfig {
  static readonly BASE_URL: string = process.env.EXPO_PUBLIC_API_URL || "";
  static readonly DEFAULT_TIMEOUT: number = 30000; // Tăng thời gian chờ lên 30 giây
}

// Function to get JWT token from SecureStore
const getAccessToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync("accessToken");
};

const getRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync("refreshToken");
};

// Create a single axios instance
const createAxiosInstance = (config: CustomApiConfig = {}): AxiosInstance => {
  if (!ApiConfig.BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is required in .env file");
  }

  return axios.create({
    baseURL: ApiConfig.BASE_URL,
    timeout: ApiConfig.DEFAULT_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.customHeaders,
      ...config.headers,
    },
    ...config,
  });
};

// Create a single instance with JWT authentication
const createAuthInstance = (config: CustomApiConfig = {}): AxiosInstance => {
  const instance = createAxiosInstance(config);

  // Request interceptor for adding auth token
  instance.interceptors.request.use(
    async (
      reqConfig: InternalAxiosRequestConfig,
    ): Promise<InternalAxiosRequestConfig> => {
      try {
        const token = await getAccessToken();
        if (token && reqConfig.headers) {
          // Decode token to get expiration time
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const expirationTime = new Date(payload.exp * 1000);
            const currentTime = new Date();
            const timeLeft =
              (expirationTime.getTime() - currentTime.getTime()) / 1000;
          }
          reqConfig.headers.Authorization = `Bearer ${token}`;
        }
        return reqConfig;
      } catch (error) {
        console.error("Error in request interceptor:", error);
        return reqConfig;
      }
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor for handling common errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized errors (token expired)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          console.log("Token expired, attempting to refresh...");
          // Try to refresh the token
          const refreshToken = await getRefreshToken();
          const deviceId = await SecureStore.getItemAsync("deviceId");
          if (!refreshToken || !deviceId) {
            throw new Error("Missing refresh token or device ID");
          }

          console.log("Refresh token found, sending refresh request...");
          const response = await axios.post(
            `${ApiConfig.BASE_URL}/auth/refresh`,
            {
              refreshToken,
              deviceId,
            },
          );

          const { accessToken } = response.data;
          if (!accessToken) {
            throw new Error("No access token received");
          }

          console.log("Successfully obtained new access token");

          // Save the new token
          await SecureStore.setItemAsync("accessToken", accessToken);

          // Update the Authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          // Retry the original request
          return instance(originalRequest);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);

          // Clear auth data on refresh token failure
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          await SecureStore.deleteItemAsync("user");
          await SecureStore.deleteItemAsync("userInfo");
          await SecureStore.deleteItemAsync("deviceId");

          // Redirect to login
          router.replace("/(screens)/(auth)/loginScreen" as any);
          return Promise.reject(refreshError);
        }
      }

      // Handle other common errors
      if (error.response) {
        // Server responded with an error status code
        console.error(
          "Response error:",
          error.response.status,
          error.response.data,
        );
      } else if (error.request) {
        // Request was made but no response was received
        console.error("Request error (no response):", error.request);

        // Get network status
        const isOnline = typeof navigator !== "undefined" && navigator.onLine;

        console.error("Network info:", {
          method: error.config?.method,
          url: error.config?.url,
          online: isOnline,
          timestamp: new Date().toISOString(),
        });

        // Kiểm tra kết nối mạng
        if (!isOnline) {
          console.error("Network is offline. Please check your connection.");
          // Create a custom error with network status information
          const networkError = new Error(
            "Network is offline. Please check your connection.",
          );
          networkError.name = "NetworkError";
          return Promise.reject(networkError);
        }
      } else {
        // Something happened in setting up the request
        console.error("Error setting up request:", error.message);
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Create and export instances
const axiosInstance = createAuthInstance();
const axiosPublicInstance = createAxiosInstance();

export {
  createAxiosInstance,
  createAuthInstance,
  axiosPublicInstance,
  axiosInstance as default,
};
