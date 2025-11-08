import { PermissionDocument } from '../../types/permission';
import { timestampToDate } from './timestamp.converter';

/**
 * Convert Firestore data (with Timestamp) to PermissionDocument (with Date objects)
 */
export const convertFirestoreToPermissionDocument = (id: string, data: any): PermissionDocument => {
	return {
		id,
		apiPath: data.apiPath,
		method: data.method,
		module: data.module,
		name: data.name,
		active: data.active,
		createdAt: timestampToDate(data.createdAt),
		createdBy: data.createdBy,
		updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : undefined,
		updatedBy: data.updatedBy,
	};
};

