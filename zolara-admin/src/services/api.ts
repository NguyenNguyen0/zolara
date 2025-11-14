import axios from 'axios';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

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

interface UpdateUserData extends Partial<CreateUserData> {}

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://api.zolara.com' 
    : 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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
  // Dashboard data
  getDashboardData: () => api.get('/dashboard'),
  
  // User management
  getUsers: (params?: UserParams) => api.get('/users', { params }),
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