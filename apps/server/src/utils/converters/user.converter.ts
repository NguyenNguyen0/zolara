import { UserDocument } from '../../types/user';
import { timestampToDate } from './timestamp.converter';

/**
 * Convert Firestore data (with Timestamp) to UserDocument (with Date objects)
 */
export const convertFirestoreToUserDocument = (id: string, data: any): UserDocument => {
	return {
		id,
		email: data.email,
		firstName: data.firstName,
		lastName: data.lastName,
		isLocked: data.isLocked,
		isActive: data.isActive,
		lastActivity: timestampToDate(data.lastActivity),
		createdAt: timestampToDate(data.createdAt),
		createdBy: data.createdBy,
		roleId: data.roleId,
		dob: data.dob ? timestampToDate(data.dob) : null,
		gender: data.gender || null,
		bio: data.bio || null,
		avatar: data.avatar || null,
		updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : undefined,
		updatedBy: data.updatedBy,
	};
};

