import { db } from '../../configs/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export interface RoleInfo {
	roleId: string | null;
	roleName: string;
}

export interface PopulatedRole {
	id: string;
	name: string;
	description: string;
	permissionIds: string[];
	active: boolean;
	createdAt: Date;
	createdBy: string;
	updatedAt?: Date;
	updatedBy?: string;
}

/**
 * Get role information from roleId
 */
export const getRoleInfo = async (roleId: string | null | undefined): Promise<RoleInfo> => {
	if (!roleId) {
		return { roleId: null, roleName: 'USER' };
	}

	try {
		const roleDoc = await db.collection('roles').doc(roleId).get();
		if (roleDoc.exists) {
			const roleData = roleDoc.data();
			return {
				roleId,
				roleName: roleData?.name || 'USER',
			};
		}
	} catch (error) {
		// Error will be handled by calling function
	}

	return { roleId: null, roleName: 'USER' };
};

/**
 * Get role information from user document
 */
export const getRoleInfoFromUser = async (userId: string): Promise<RoleInfo> => {
	try {
		const userDoc = await db.collection('users').doc(userId).get();
		if (userDoc.exists) {
			const userData = userDoc.data();
			const roleId = userData?.roleId;
			return await getRoleInfo(roleId);
		}
	} catch (error) {
		// Error will be handled by calling function
	}

	return { roleId: null, roleName: 'USER' };
};

/**
 * Convert Firestore Timestamp to Date
 */
const timestampToDate = (timestamp: any): Date => {
	if (timestamp instanceof Timestamp) {
		return timestamp.toDate();
	}
	if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
		return timestamp.toDate();
	}
	if (timestamp instanceof Date) {
		return timestamp;
	}
	if (typeof timestamp === 'string') {
		return new Date(timestamp);
	}
	return new Date();
};

/**
 * Populate role object from roleId
 */
export const populateRole = async (roleId: string | null | undefined): Promise<PopulatedRole | null> => {
	if (!roleId) {
		return null;
	}

	try {
		const roleDoc = await db.collection('roles').doc(roleId).get();
		if (roleDoc.exists) {
			const roleData = roleDoc.data();
			if (!roleData) return null;
			
			return {
				id: roleDoc.id,
				...roleData,
				// Convert Timestamp to Date objects
				createdAt: timestampToDate(roleData.createdAt),
				updatedAt: roleData.updatedAt ? timestampToDate(roleData.updatedAt) : undefined,
			} as PopulatedRole;
		}
	} catch (error) {
		// Error will be handled by calling function
	}

	return null;
};

