export interface Permission {
	id?: string; // Firestore document ID
	apiPath: string; // e.g., "/api/users", "/api/users/{id}"
	method: string; // GET, POST, PUT, DELETE, PATCH
	module: string; // USER, AUTH, ACCESS-CONTROLLER
	name: string; // Vietnamese name, e.g., "Lấy danh sách User"
	active?: boolean;
	createdAt?: Date;
	createdBy?: string;
	updatedAt?: Date;
	updatedBy?: string;
}

export interface PermissionDocument extends Permission {
	id: string;
	apiPath: string;
	method: string;
	module: string;
	name: string;
	active: boolean;
	createdAt: Date;
	createdBy: string;
	// Optional fields (only present when updated)
	updatedAt?: Date;
	updatedBy?: string;
}

export interface PermissionCreateData {
	apiPath: string;
	method: string;
	module: string;
	name: string;
	active?: boolean;
	createdBy: string;
}

export interface PermissionUpdateData {
	apiPath?: string;
	method?: string;
	module?: string;
	name?: string;
	active?: boolean;
}

export interface RolePermission {
	id?: string;
	roleId: string;
	permissionId: string;
	createdAt?: Date;
	createdBy?: string;
}

