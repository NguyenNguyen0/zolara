export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	isLocked: boolean;
	isActive: boolean;
	lastActivity: Date;
	createdAt: Date;
	createdBy: string;
	roleId: string;
	dob: Date | null;
	gender: string | null;
	bio: string | null;
	avatar: string | null;
	updatedAt?: Date;
	updatedBy?: string;
}

export interface UserDocument {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	isLocked: boolean;
	isActive: boolean;
	lastActivity: Date;
	createdAt: Date;
	createdBy: string;
	roleId: string; // ID of role document
	dob: Date | null;
	gender: string | null;
	bio: string | null;
	avatar: string | null;
	// Optional fields (only present when updated)
	updatedAt?: Date;
	updatedBy?: string;
}

export interface UserCreateData {
	email: string;
	firstName?: string;
	lastName?: string;
	isLocked?: boolean;
	isActive?: boolean;
	lastActivity?: Date;
	roleId: string;
	createdBy: string;
	dob?: Date | null;
	gender?: string | null;
	bio?: string | null;
	avatar?: string | null;
}

export interface UserUpdateData {
	firstName?: string;
	lastName?: string;
	isLocked?: boolean;
	isActive?: boolean;
	lastActivity?: Date;
	roleId?: string;
	dob?: Date | null;
	gender?: string | null;
	bio?: string | null;
	avatar?: string | null;
}

export interface UserResponse {
	uid: string;
	email: string;
	token?: string;
	roleId: string | null;
	roleName: string;
	firstName: string;
	lastName: string;
	isLocked: boolean;
	isActive: boolean;
	lastActivity: Date;
	createdAt: Date;
	createdBy: string;
	dob: Date | null;
	gender: string | null;
	bio: string | null;
	avatar: string | null;
	updatedAt?: Date;
	updatedBy?: string;
	emailVerified?: boolean;
}

export interface UserRequest {
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	bio?: string;
	dob?: string;
	gender?: string;
	avatar?: string;
	isLocked?: boolean;
	roleId?: string;
}

