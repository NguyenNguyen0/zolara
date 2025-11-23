// Types
export interface User {
  id?: string;
  userId?: string;
  name?: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  fullName?: string;
  profilePictureUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  statusMessage?: string;
  coverImgUrl?: string;
  message?: string;
}

export interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password: string;
  deviceType?: "WEB" | "MOBILE" | "DESKTOP";
  deviceName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  fetchUserProfile: (userId?: string) => Promise<Partial<User> | null>;
}
