import { db } from '../../configs/firebase';
import { AppError } from '../../types';
import { convertFirestoreToPermissionDocument } from '../converters';
import { PermissionDocument } from '../../types/permission';

/**
 * Validate permission IDs and return invalid ones
 */
export const validatePermissionIds = async (permissionIds: string[]): Promise<string[]> => {
	if (permissionIds.length === 0) {
		return [];
	}

	const permissionChecks = await Promise.all(
		permissionIds.map(async (permId: string) => {
			const permDoc = await db.collection('permissions').doc(permId).get();
			return { id: permId, exists: permDoc.exists };
		}),
	);

	return permissionChecks.filter((check) => !check.exists).map((check) => check.id);
};

/**
 * Validate permission IDs and throw error if any are invalid
 */
export const validatePermissionIdsOrThrow = async (permissionIds: string[]): Promise<void> => {
	if (permissionIds.length === 0) {
		return;
	}

	const invalidIds = await validatePermissionIds(permissionIds);

	if (invalidIds.length > 0) {
		throw new AppError('One or more permission IDs are invalid', 400, 'VALIDATION', {
			errors: [
				{
					field: 'permissionIds',
					code: 'invalid',
					message: `Invalid permission IDs: ${invalidIds.join(', ')}`,
				},
			],
		});
	}
};

/**
 * Get permissions with populated data from permission IDs
 * Returns PermissionDocument[] with proper type conversion
 */
export const getPermissionsByIds = async (permissionIds: string[]): Promise<PermissionDocument[]> => {
	if (permissionIds.length === 0) {
		return [];
	}

	const permissions = await Promise.all(
		permissionIds.map(async (permId: string) => {
			const permDoc = await db.collection('permissions').doc(permId).get();
			if (!permDoc.exists) return null;
			
			const permData = permDoc.data();
			if (!permData) return null;

			return convertFirestoreToPermissionDocument(permDoc.id, permData);
		}),
	);

	return permissions.filter((p) => p !== null) as PermissionDocument[];
};

