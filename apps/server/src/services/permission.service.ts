import { db } from '../configs/firebase';
import { PermissionDocument, PermissionCreateData, PermissionUpdateData } from '../types/permission';
import { Timestamp } from 'firebase-admin/firestore';
import { ErrorCode, ErrorMessage, createServiceError } from '../constants/errors';
import { convertFirestoreToPermissionDocument } from '../utils/converters';

/**
 * Create a new permission document in Firestore
 */
export const createPermissionDocument = async (
	data: PermissionCreateData,
): Promise<PermissionDocument> => {
	const now = new Date();

	const permissionDocData: any = {
		apiPath: data.apiPath,
		method: data.method.toUpperCase(),
		module: data.module,
		name: data.name,
		active: data.active !== undefined ? data.active : true,
		createdAt: Timestamp.fromDate(now),
		createdBy: data.createdBy,
		// Note: updatedAt and updatedBy are NOT included in creation
	};

	const docRef = db.collection('permissions').doc();
	await docRef.set(permissionDocData);

	return convertFirestoreToPermissionDocument(docRef.id, permissionDocData);
};

/**
 * Update permission document in Firestore
 * Always adds updatedAt and updatedBy when updating
 */
export const updatePermissionDocument = async (
	permissionId: string,
	data: PermissionUpdateData,
	updatedBy: string,
): Promise<PermissionDocument> => {
	const now = new Date();

	const updateData: any = {
		updatedAt: Timestamp.fromDate(now),
		updatedBy,
	};

	// Only include fields that are provided
	if (data.apiPath !== undefined) updateData.apiPath = data.apiPath;
	if (data.method !== undefined) updateData.method = data.method.toUpperCase();
	if (data.module !== undefined) updateData.module = data.module;
	if (data.name !== undefined) updateData.name = data.name;
	if (data.active !== undefined) updateData.active = data.active;

	await db.collection('permissions').doc(permissionId).update(updateData);

	// Get updated document
	const permissionDoc = await db.collection('permissions').doc(permissionId).get();
	const permissionData = permissionDoc.data();

	if (!permissionData) {
		throw createServiceError(ErrorMessage.DOCUMENT_NOT_FOUND, ErrorCode.DOCUMENT_NOT_FOUND);
	}

	return convertFirestoreToPermissionDocument(permissionId, permissionData);
};

/**
 * Get permission document by ID
 */
export const getPermissionDocument = async (permissionId: string): Promise<PermissionDocument | null> => {
	const permissionDoc = await db.collection('permissions').doc(permissionId).get();

	if (!permissionDoc.exists) {
		return null;
	}

	const permissionData = permissionDoc.data();
	if (!permissionData) {
		return null;
	}

	return convertFirestoreToPermissionDocument(permissionId, permissionData);
};

/**
 * Get permissions with filtering
 */
export interface GetPermissionsOptions {
	module?: string;
	active?: boolean;
}

export interface GetPermissionsResult {
	permissions: PermissionDocument[];
}

export const getPermissionsService = async (options: GetPermissionsOptions = {}): Promise<GetPermissionsResult> => {
	const { module, active } = options;

	let query: any = db.collection('permissions');

	if (module) {
		query = query.where('module', '==', module);
	}

	if (active !== undefined) {
		query = query.where('active', '==', active);
	}

	const snapshot = await query.get();
	const permissions = snapshot.docs.map((doc: any) => {
		const data = doc.data();
		return convertFirestoreToPermissionDocument(doc.id, data);
	});

	return { permissions };
};

/**
 * Get permission by ID
 */
export const getPermissionByIdService = async (permissionId: string): Promise<PermissionDocument | null> => {
	return await getPermissionDocument(permissionId);
};

/**
 * Create permission with validation
 */
export const createPermissionService = async (
	data: PermissionCreateData,
	createdBy: string,
): Promise<PermissionDocument> => {
	// Check for duplicate permission
	const existingPermissions = await db
		.collection('permissions')
		.where('apiPath', '==', data.apiPath)
		.where('method', '==', data.method.toUpperCase())
		.get();

	if (!existingPermissions.empty) {
		throw createServiceError(ErrorMessage.PERMISSION_ALREADY_EXISTS, ErrorCode.PERMISSION_ALREADY_EXISTS);
	}

	return await createPermissionDocument({
		...data,
		createdBy,
	});
};

/**
 * Update permission with validation
 */
export const updatePermissionService = async (
	permissionId: string,
	data: PermissionUpdateData,
	updatedBy: string,
): Promise<PermissionDocument> => {
	// Verify permission exists
	const existingPermission = await getPermissionDocument(permissionId);
	if (!existingPermission) {
		throw createServiceError(ErrorMessage.PERMISSION_NOT_FOUND, ErrorCode.PERMISSION_NOT_FOUND);
	}

	// Check for duplicate if apiPath or method is being updated
	if (data.apiPath !== undefined || data.method !== undefined) {
		const checkApiPath = data.apiPath || existingPermission.apiPath;
		const checkMethod = (data.method || existingPermission.method).toUpperCase();

		const existingPermissions = await db
			.collection('permissions')
			.where('apiPath', '==', checkApiPath)
			.where('method', '==', checkMethod)
			.get();

		const isDuplicate = existingPermissions.docs.some((doc) => doc.id !== permissionId);
		if (isDuplicate) {
			throw createServiceError(ErrorMessage.PERMISSION_ALREADY_EXISTS, ErrorCode.PERMISSION_ALREADY_EXISTS);
		}
	}

	return await updatePermissionDocument(permissionId, data, updatedBy);
};

/**
 * Delete permission with validation
 */
export const deletePermissionService = async (permissionId: string): Promise<void> => {
	// Verify permission exists
	const permission = await getPermissionDocument(permissionId);
	if (!permission) {
		throw createServiceError(ErrorMessage.PERMISSION_NOT_FOUND, ErrorCode.PERMISSION_NOT_FOUND);
	}

	// Check if permission is assigned to roles
	const rolesSnapshot = await db.collection('roles').get();
	const rolesUsingPermission = rolesSnapshot.docs.filter((doc) => {
		const permissionIds = doc.data()?.permissionIds || [];
		return permissionIds.includes(permissionId);
	});

	if (rolesUsingPermission.length > 0) {
		throw createServiceError(ErrorMessage.PERMISSION_IN_USE, ErrorCode.PERMISSION_IN_USE);
	}

	// Delete permission
	await db.collection('permissions').doc(permissionId).delete();
};
