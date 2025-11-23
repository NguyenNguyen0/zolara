import axios from 'axios';
import { getApiBaseUrl } from '../lib/config';

// Runtime environment config interface
interface RuntimeEnv {
  VITE_API_BASE_URL?: string;
}

// Extend Window interface
declare global {
  interface Window {
    _env_?: RuntimeEnv;
  }
}

// Types
interface UserParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  role: string;
}

type UpdateUserData = Partial<CreateUserData>

interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password: string;
  deviceType?: 'WEB' | 'MOBILE' | 'DESKTOP';
  deviceName?: string;
}

// Create an axios instance with default configuration
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and set baseURL dynamically
api.interceptors.request.use(
  (config) => {
    // Set baseURL dynamically on each request
    config.baseURL = getApiBaseUrl();
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth
  login: (credentials: LoginCredentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  
  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),
  getUserStatistics: () => api.get('/dashboard/user-statistics'),
  
  // User management
  getUsers: (params?: UserParams) => api.get('/users', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  getUserBasicInfo: (id: string) => api.get(`/users/${id}/basic-info`),
  createUser: (userData: CreateUserData) => api.post('/users', userData),
  updateUser: (id: string, userData: UpdateUserData) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  
  // Analytics
  getAnalytics: (dateRange: { start: string; end: string }) => 
    api.get('/analytics', { params: dateRange }),
  
  // Reports
  exportReport: (type: string) => api.get(`/reports/${type}`, { 
    responseType: 'blob' 
  }),
};

export default api;