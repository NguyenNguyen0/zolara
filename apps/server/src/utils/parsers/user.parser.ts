import { UserUpdateData } from '../../types/user';

/**
 * Parse and normalize user update data
 * Converts string dates to Date objects
 */
export const parseUserUpdateData = (data: any): UserUpdateData => {
	const updateData: UserUpdateData = { ...data };

	// Convert date strings to Date objects if provided
	if (updateData.dob && typeof updateData.dob === 'string') {
		updateData.dob = new Date(updateData.dob);
	}
	if (updateData.lastActivity && typeof updateData.lastActivity === 'string') {
		updateData.lastActivity = new Date(updateData.lastActivity);
	}

	return updateData;
};

