export interface AuthUser {
	uid: string;
	email: string;
	roleId: string | null;
	role: string;
	permissions?: string[];
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}

