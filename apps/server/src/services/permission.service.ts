import { db } from '../configs/firebase';
import { PermissionDocument, PermissionCreateData, PermissionUpdateData } from '../types/permission';

/**
 * Create a new permission document in Firestore
 */
export const createPermissionDocument = async (
	data: PermissionCreateData,
): Promise<PermissionDocument> => {
	const now = new Date().toISOString();

	const permissionDoc: Omit<PermissionDocument, 'id'> = {
		apiPath: data.apiPath,
		method: data.method.toUpperCase(),
		module: data.module,
		name: data.name,
		active: data.active !== undefined ? data.active : true,
		createdAt: now,
		createdBy: data.createdBy,
		// Note: updatedAt and updatedBy are NOT included in creation
	};

	const docRef = db.collection('permissions').doc();
	await docRef.set(permissionDoc);

	return {
		id: docRef.id,
		...permissionDoc,
	};
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
	const now = new Date().toISOString();

	const updateData: Partial<PermissionDocument> = {
		updatedAt: now,
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

	return {
		id: permissionId,
		...permissionData,
	} as PermissionDocument;
};

