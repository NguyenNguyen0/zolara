import { db } from '../configs/firebase';

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
	createdAt: string;
	createdBy: string;
	updatedAt?: string;
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
 * Populate role object from roleId
 */
export const populateRole = async (roleId: string | null | undefined): Promise<PopulatedRole | null> => {
	if (!roleId) {
		return null;
	}

	try {
		const roleDoc = await db.collection('roles').doc(roleId).get();
		if (roleDoc.exists) {
			return {
				id: roleDoc.id,
				...roleDoc.data(),
			} as PopulatedRole;
		}
	} catch (error) {
		// Error will be handled by calling function
	}

	return null;
};

