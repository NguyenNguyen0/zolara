import { db } from '../configs/firebase';
import { RoleDocument, RoleCreateData, RoleUpdateData } from '../types/role';

/**
 * Create a new role document in Firestore
 */
export const createRoleDocument = async (data: RoleCreateData): Promise<RoleDocument> => {
	const now = new Date().toISOString();

	const roleDoc: Omit<RoleDocument, 'id'> = {
		name: data.name.toUpperCase(),
		description: data.description,
		permissionIds: data.permissionIds || [],
		active: data.active !== undefined ? data.active : true,
		createdAt: now,
		createdBy: data.createdBy,
		// Note: updatedAt and updatedBy are NOT included in creation
	};

	const docRef = db.collection('roles').doc();
	await docRef.set(roleDoc);

	return {
		id: docRef.id,
		...roleDoc,
	};
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
	const now = new Date().toISOString();

	const updateData: Partial<RoleDocument> = {
		updatedAt: now,
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

	return {
		id: roleId,
		...roleData,
	} as RoleDocument;
};

