import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API methods
export const api = {
  get: <T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.get(url),

  post: <T>(url: string, data?: unknown): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.post(url, data),

  put: <T>(url: string, data?: unknown): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.put(url, data),

  delete: <T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.delete(url),

  patch: <T>(url: string, data?: unknown): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.patch(url, data),
};

export default api;
