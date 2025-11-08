import { RoleDocument } from '../../types/role';
import { timestampToDate } from './timestamp.converter';

/**
 * Convert Firestore data (with Timestamp) to RoleDocument (with Date objects)
 */
export const convertFirestoreToRoleDocument = (id: string, data: any): RoleDocument => {
	return {
		id,
		name: data.name,
		description: data.description,
		permissionIds: data.permissionIds || [],
		active: data.active,
		createdAt: timestampToDate(data.createdAt),
		createdBy: data.createdBy,
		updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : undefined,
		updatedBy: data.updatedBy,
	};
};

