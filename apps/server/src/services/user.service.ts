import { db } from '../configs/firebase';
import { UserDocument, UserCreateData, UserUpdateData } from '../types/user';

/**
 * Create a new user document in Firestore
 */
export const createUserDocument = async (
	userId: string,
	data: UserCreateData,
): Promise<UserDocument> => {
	const now = new Date().toISOString();

	const userDoc: Omit<UserDocument, 'id'> = {
		email: data.email,
		firstName: data.firstName || '',
		lastName: data.lastName || '',
		enable: data.enable !== undefined ? data.enable : true,
		active: data.active !== undefined ? data.active : true,
		isOnline: data.isOnline !== undefined ? data.isOnline : false,
		lastSeen: data.lastSeen || now,
		createdAt: now,
		createdBy: data.createdBy,
		roleId: data.roleId,
		dob: data.dob || null,
		gender: data.gender || null,
		typingTo: data.typingTo || null,
		bio: data.bio || null,
		avatar: data.avatar || null,
		// Note: updatedAt and updatedBy are NOT included in creation
	};

	await db.collection('users').doc(userId).set(userDoc);

	return {
		id: userId,
		...userDoc,
	};
};

/**
 * Update user document in Firestore
 * Always adds updatedAt and updatedBy when updating
 */
export const updateUserDocument = async (
	userId: string,
	data: UserUpdateData,
	updatedBy: string,
): Promise<UserDocument> => {
	const now = new Date().toISOString();

	const updateData: Partial<UserDocument> = {
		updatedAt: now,
		updatedBy,
	};

	// Only include fields that are provided
	if (data.firstName !== undefined) updateData.firstName = data.firstName;
	if (data.lastName !== undefined) updateData.lastName = data.lastName;
	if (data.enable !== undefined) updateData.enable = data.enable;
	if (data.active !== undefined) updateData.active = data.active;
	if (data.isOnline !== undefined) updateData.isOnline = data.isOnline;
	if (data.lastSeen !== undefined) updateData.lastSeen = data.lastSeen;
	if (data.roleId !== undefined) updateData.roleId = data.roleId;
	if (data.dob !== undefined) updateData.dob = data.dob;
	if (data.gender !== undefined) updateData.gender = data.gender;
	if (data.typingTo !== undefined) updateData.typingTo = data.typingTo;
	if (data.bio !== undefined) updateData.bio = data.bio;
	if (data.avatar !== undefined) updateData.avatar = data.avatar;

	await db.collection('users').doc(userId).update(updateData);

	// Get updated document
	const userDoc = await db.collection('users').doc(userId).get();
	const userData = userDoc.data();

	return {
		id: userId,
		...userData,
	} as UserDocument;
};

/**
 * Get user document from Firestore with full data
 */
export const getUserDocument = async (userId: string): Promise<UserDocument | null> => {
	const userDoc = await db.collection('users').doc(userId).get();

	if (!userDoc.exists) {
		return null;
	}

	const userData = userDoc.data();
	return {
		id: userId,
		...userData,
	} as UserDocument;
};

