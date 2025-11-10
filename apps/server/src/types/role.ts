import { PermissionDocument } from './permission';

export interface Role {
	id?: string; // Firestore document ID
	name: string; // ADMIN, USER
	description: string; // Vietnamese description
	permissionIds?: string[]; // Array of permission IDs
	active?: boolean;
	createdAt?: Date;
	createdBy?: string;
	updatedAt?: Date;
	updatedBy?: string;
}

export interface RoleDocument extends Role {
	id: string;
	name: string;
	description: string;
	permissionIds: string[];
	active: boolean;
	createdAt: Date;
	createdBy: string;
	// Optional fields (only present when updated)
	updatedAt?: Date;
	updatedBy?: string;
}

export interface RoleCreateData {
	name: string;
	description: string;
	permissionIds?: string[];
	active?: boolean;
	createdBy: string;
}

export interface RoleUpdateData {
	name?: string;
	description?: string;
	permissionIds?: string[];
	active?: boolean;
}

export interface RoleWithPermissions extends RoleDocument {
	permissions: PermissionDocument[];
}

