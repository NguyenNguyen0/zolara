import { db } from '../configs/firebase';
import { RoleDocument, RoleCreateData, RoleUpdateData, RoleWithPermissions } from '../types/role';
import { Timestamp } from 'firebase-admin/firestore';
import { ErrorCode, ErrorMessage, createServiceError } from '../constants/errors';
import { convertFirestoreToRoleDocument } from '../utils/converters';
import { validatePermissionIdsOrThrow, getPermissionsByIds } from '../utils/helpers';
import { PermissionDocument } from '../types/permission';

/**
 * Create a new role document in Firestore
 */
export const createRoleDocument = async (data: RoleCreateData): Promise<RoleDocument> => {
	const now = new Date();

	const roleDocData: any = {
		name: data.name.toUpperCase(),
		description: data.description,
		permissionIds: data.permissionIds || [],
		active: data.active !== undefined ? data.active : true,
		createdAt: Timestamp.fromDate(now),
		createdBy: data.createdBy,
		updatedAt: Timestamp.fromDate(now),
		updatedBy: data.createdBy,
	};

	const docRef = db.collection('roles').doc();
	await docRef.set(roleDocData);

	return convertFirestoreToRoleDocument(docRef.id, roleDocData);
};

/**
 * Update role document in Firestore
 * Always adds updatedAt and updatedBy when updating
 */
export const updateRoleDocument = async (
	roleId: string,
	data: RoleUpdateData,
	updatedBy: string,
): Promise<RoleDocument> => {
	const now = new Date();

	const updateData: any = {
		updatedAt: Timestamp.fromDate(now),
		updatedBy,
	};

	// Only include fields that are provided
	if (data.name !== undefined) updateData.name = data.name.toUpperCase();
	if (data.description !== undefined) updateData.description = data.description;
	if (data.permissionIds !== undefined) updateData.permissionIds = data.permissionIds;
	if (data.active !== undefined) updateData.active = data.active;

	await db.collection('roles').doc(roleId).update(updateData);

	// Get updated document
	const roleDoc = await db.collection('roles').doc(roleId).get();
	const roleData = roleDoc.data();

	if (!roleData) {
		throw createServiceError(ErrorMessage.DOCUMENT_NOT_FOUND, ErrorCode.DOCUMENT_NOT_FOUND);
	}

	return convertFirestoreToRoleDocument(roleId, roleData);
};

/**
 * Get role document by ID
 */
export const getRoleDocument = async (roleId: string): Promise<RoleDocument | null> => {
	const roleDoc = await db.collection('roles').doc(roleId).get();

	if (!roleDoc.exists) {
		return null;
	}

	const roleData = roleDoc.data();
	if (!roleData) {
		return null;
	}

	return convertFirestoreToRoleDocument(roleId, roleData);
};

/**
 * Get roles with filtering
 */
export interface GetRolesOptions {
	active?: boolean;
}

export interface GetRolesResult {
	roles: RoleWithPermissions[];
}

export const getRolesService = async (options: GetRolesOptions = {}): Promise<GetRolesResult> => {
	const { active } = options;

	let query: any = db.collection('roles');

	if (active !== undefined) {
		query = query.where('active', '==', active);
	}

	const snapshot = await query.get();
	const roles = await Promise.all(
		snapshot.docs.map(async (doc: any) => {
			const roleData = doc.data();
			const roleDocument = convertFirestoreToRoleDocument(doc.id, roleData);
			const permissions = await getPermissionsByIds(roleDocument.permissionIds);
			
			return {
				...roleDocument,
				permissions,
			} as RoleWithPermissions;
		}),
	);

	return { roles };
};

/**
 * Get role by ID with permissions
 */
export const getRoleByIdService = async (roleId: string): Promise<RoleWithPermissions | null> => {
	const role = await getRoleDocument(roleId);
	if (!role) {
		return null;
	}

	const permissions = await getPermissionsByIds(role.permissionIds);
	
	return {
		...role,
		permissions,
	} as RoleWithPermissions;
};

/**
 * Create role with validation
 */
export const createRoleService = async (
	data: RoleCreateData,
	createdBy: string,
): Promise<RoleWithPermissions> => {
	// Validate permission IDs if provided
	if (data.permissionIds && data.permissionIds.length > 0) {
		await validatePermissionIdsOrThrow(data.permissionIds);
	}

	// Check for duplicate role name
	const existingRoles = await db.collection('roles').where('name', '==', data.name.toUpperCase()).get();
	if (!existingRoles.empty) {
		throw createServiceError(ErrorMessage.ROLE_ALREADY_EXISTS, ErrorCode.ROLE_ALREADY_EXISTS);
	}

	const role = await createRoleDocument({
		...data,
		createdBy,
	});
	
	const permissions = await getPermissionsByIds(role.permissionIds);
	
	return {
		...role,
		permissions,
	} as RoleWithPermissions;
};

/**
 * Update role with validation
 */
export const updateRoleService = async (
	roleId: string,
	data: RoleUpdateData,
	updatedBy: string,
): Promise<RoleWithPermissions> => {
	// Verify role exists
	const existingRole = await getRoleDocument(roleId);
	if (!existingRole) {
		throw createServiceError(ErrorMessage.ROLE_NOT_FOUND, ErrorCode.ROLE_NOT_FOUND);
	}

	// Check for duplicate name if name is being updated
	if (data.name !== undefined) {
		const existingRoles = await db
			.collection('roles')
			.where('name', '==', data.name.toUpperCase())
			.get();

		const isDuplicate = existingRoles.docs.some((doc) => doc.id !== roleId);
		if (isDuplicate) {
			throw createServiceError(ErrorMessage.ROLE_ALREADY_EXISTS, ErrorCode.ROLE_ALREADY_EXISTS);
		}
	}

	// Validate permission IDs if provided
	if (data.permissionIds !== undefined && data.permissionIds.length > 0) {
		await validatePermissionIdsOrThrow(data.permissionIds);
	}

	const updatedRole = await updateRoleDocument(roleId, data, updatedBy);
	const permissions = await getPermissionsByIds(updatedRole.permissionIds);
	
	return {
		...updatedRole,
		permissions,
	} as RoleWithPermissions;
};

/**
 * Delete role with validation
 */
export const deleteRoleService = async (roleId: string): Promise<void> => {
	// Verify role exists
	const role = await getRoleDocument(roleId);
	if (!role) {
		throw createServiceError(ErrorMessage.ROLE_NOT_FOUND, ErrorCode.ROLE_NOT_FOUND);
	}

	// Check if role is assigned to users
	const usersSnapshot = await db.collection('users').where('roleId', '==', roleId).get();
	if (!usersSnapshot.empty) {
		throw createServiceError(ErrorMessage.ROLE_IN_USE, ErrorCode.ROLE_IN_USE);
	}

	// Delete role
	await db.collection('roles').doc(roleId).delete();
};

/**
 * Update role permissions
 */
export const updateRolePermissionsService = async (
	roleId: string,
	permissionIds: string[],
	updatedBy: string,
): Promise<RoleWithPermissions> => {
	// Verify role exists
	const role = await getRoleDocument(roleId);
	if (!role) {
		throw createServiceError(ErrorMessage.ROLE_NOT_FOUND, ErrorCode.ROLE_NOT_FOUND);
	}

	// Validate permission IDs
	if (permissionIds.length > 0) {
		await validatePermissionIdsOrThrow(permissionIds);
	}

	// Update role permissions
	const updatedRole = await updateRoleDocument(
		roleId,
		{ permissionIds },
		updatedBy,
	);
	
	const permissions = await getPermissionsByIds(updatedRole.permissionIds);
	
	return {
		...updatedRole,
		permissions,
	} as RoleWithPermissions;
};
