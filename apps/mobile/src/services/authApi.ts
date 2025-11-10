import instance from '@/src/config/axios.client';
import type { ApiResponse } from '@/src/config/axios.client';

// ============================================================
// Types
// ============================================================
export interface LoginRequest {
	email: string;
	password: string;
}

export interface SignupRequest {
	email: string;
	password: string;
}

export interface RefreshTokenRequest {
	uid: string;
}

export interface AuthResponse {
	id: string;
	email: string;
	accessToken: string;
	roleId: string;
	roleName: string;
}

export interface UserProfile {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	bio?: string;
	gender?: string;
	avatar?: string;
	dob?: string | null;
	roleId?: string;
	roleName?: string;
	isLocked?: boolean;
	isActive?: boolean;
	lastActivity?: string;
	createdAt?: string;
	updatedAt?: string;
	emailVerified?: boolean;
}

// ============================================================
// Auth API Services
// ============================================================

/**
 * Login với email và password
 * POST /api/auth/login
 */
export const loginApi = async (data: LoginRequest) => {
	return instance.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
};

/**
 * Signup với email và password
 * POST /api/auth/signup
 */
export const signupApi = async (data: SignupRequest) => {
	return instance.post<ApiResponse<AuthResponse>>('/api/auth/signup', data);
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
export const refreshTokenApi = async (uid: string) => {
	return instance.post<ApiResponse<{ accessToken: string }>>(
		'/api/auth/refresh',
		{ uid }
	);
};

/**
 * Lấy thông tin user hiện tại
 * GET /api/auth/me
 */
export const getMeApi = async () => {
	return instance.get<ApiResponse<UserProfile>>('/api/auth/me');
};
