export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	enable: boolean;
	active: boolean;
	isOnline: boolean;
	lastSeen: string;
	createdAt: string;
	createdBy: string;
	roleId: string;
	dob: string | null;
	gender: string | null;
	typingTo: string | null;
	bio: string | null;
	avatar: string | null;
	updatedAt?: string;
	updatedBy?: string;
}

export interface UserDocument {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	enable: boolean;
	active: boolean;
	isOnline: boolean;
	lastSeen: string;
	createdAt: string;
	createdBy: string;
	roleId: string; // ID of role document
	dob: string | null;
	gender: string | null;
	typingTo: string | null;
	bio: string | null;
	avatar: string | null;
	// Optional fields (only present when updated)
	updatedAt?: string;
	updatedBy?: string;
}

export interface UserCreateData {
	email: string;
	firstName?: string;
	lastName?: string;
	enable?: boolean;
	active?: boolean;
	isOnline?: boolean;
	lastSeen?: string;
	roleId: string;
	createdBy: string;
	dob?: string | null;
	gender?: string | null;
	typingTo?: string | null;
	bio?: string | null;
	avatar?: string | null;
}

export interface UserUpdateData {
	firstName?: string;
	lastName?: string;
	enable?: boolean;
	active?: boolean;
	isOnline?: boolean;
	lastSeen?: string;
	roleId?: string;
	dob?: string | null;
	gender?: string | null;
	typingTo?: string | null;
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
	enable: boolean;
	active: boolean;
	isOnline: boolean;
	lastSeen: string;
	createdAt: string;
	createdBy: string;
	dob: string | null;
	gender: string | null;
	typingTo: string | null;
	bio: string | null;
	avatar: string | null;
	updatedAt?: string;
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
	enable?: boolean;
	active?: boolean;
	roleId?: string;
}

