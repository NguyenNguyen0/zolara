export interface AuthRequest {
	email: string;
	password: string;
}

export interface RefreshTokenRequest {
	uid: string;
}

export interface SignupResponse {
	id: string;
	email: string;
	roleId: string | null;
	roleName: string;
}

export interface AuthResponse {
	id: string;
	email: string;
	accessToken: string;
	roleId: string | null;
	roleName: string;
}

