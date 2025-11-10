import { db, auth } from '../configs/firebase';
import { UserDocument, UserCreateData, UserUpdateData } from '../types/user';
import { Timestamp } from 'firebase-admin/firestore';
import { ErrorCode, ErrorMessage, createServiceError } from '../constants/errors';
import { convertFirestoreToUserDocument, dateToTimestamp } from '../utils/converters';
import { parseUserUpdateData } from '../utils/parsers/user.parser';

/**
 * Create a new user document in Firestore
 */
export const createUserDocument = async (
	userId: string,
	data: UserCreateData,
): Promise<UserDocument> => {
	const now = new Date();

	const userDocData: any = {
		email: data.email,
		firstName: data.firstName || '',
		lastName: data.lastName || '',
		isLocked: data.isLocked !== undefined ? data.isLocked : false,
		isActive: data.isActive !== undefined ? data.isActive : false,
		lastActivity: dateToTimestamp(data.lastActivity || now),
		createdAt: Timestamp.fromDate(now),
		createdBy: data.createdBy,
		updatedAt: Timestamp.fromDate(now),
		updatedBy: data.createdBy,
		roleId: data.roleId,
		dob: dateToTimestamp(data.dob),
		gender: data.gender || null,
		bio: data.bio || null,
		avatar: data.avatar || null,
	};

	await db.collection('users').doc(userId).set(userDocData);

	return convertFirestoreToUserDocument(userId, userDocData);
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
	const now = new Date();

	const updateData: any = {
		updatedAt: Timestamp.fromDate(now),
		updatedBy,
	};

	// Only include fields that are provided
	if (data.firstName !== undefined) updateData.firstName = data.firstName;
	if (data.lastName !== undefined) updateData.lastName = data.lastName;
	if (data.isLocked !== undefined) updateData.isLocked = data.isLocked;
	if (data.isActive !== undefined) updateData.isActive = data.isActive;
	if (data.lastActivity !== undefined) updateData.lastActivity = dateToTimestamp(data.lastActivity);
	if (data.roleId !== undefined) updateData.roleId = data.roleId;
	if (data.dob !== undefined) updateData.dob = dateToTimestamp(data.dob);
	if (data.gender !== undefined) updateData.gender = data.gender;
	if (data.bio !== undefined) updateData.bio = data.bio;
	if (data.avatar !== undefined) updateData.avatar = data.avatar;

	await db.collection('users').doc(userId).update(updateData);

	// Get updated document
	const userDoc = await db.collection('users').doc(userId).get();
	const userData = userDoc.data();

	if (!userData) {
		throw createServiceError(ErrorMessage.USER_UPDATE_FAILED, ErrorCode.USER_UPDATE_FAILED);
	}

	return convertFirestoreToUserDocument(userId, userData);
};

/**
 * Update user with validation and authorization checks
 */
export const updateUserService = async (
	userId: string,
	data: any,
	updatedBy: string,
	isAdmin: boolean,
	currentUserId: string,
): Promise<UserDocument> => {
	// Verify user exists
	const existingUser = await getUserDocument(userId);
	if (!existingUser) {
		throw createServiceError(ErrorMessage.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
	}

	// Parse and normalize update data
	const updateData = parseUserUpdateData(data);

	// Non-admin users cannot update isLocked
	if (updateData.isLocked !== undefined && !isAdmin) {
		delete updateData.isLocked;
	}

	return await updateUserDocument(userId, updateData, updatedBy);
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
	if (!userData) {
		return null;
	}

	return convertFirestoreToUserDocument(userId, userData);
};

/**
 * Get users with pagination and filtering
 */
export interface GetUsersOptions {
	page?: number;
	pageSize?: number;
	isLocked?: boolean;
}

export interface GetUsersResult {
	users: UserDocument[];
	total: number;
	page: number;
	pageSize: number;
}

export const getUsersWithPagination = async (options: GetUsersOptions = {}): Promise<GetUsersResult> => {
	const { page = 1, pageSize = 20, isLocked } = options;

	if (isLocked !== undefined) {
		// When filtering by isLocked, we need to fetch all and filter in memory
		// (Firestore doesn't support efficient filtering on boolean fields without index)
		const allUsersSnapshot = await db.collection('users').get();
		
		const filteredUsers = allUsersSnapshot.docs
			.map((doc) => {
				const userData = doc.data();
				return convertFirestoreToUserDocument(doc.id, userData);
			})
			.filter((user) => user.isLocked === isLocked)
			.sort((a, b) => {
				return b.createdAt.getTime() - a.createdAt.getTime();
			});

		const total = filteredUsers.length;
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

		return {
			users: paginatedUsers,
			total,
			page,
			pageSize,
		};
	} else {
		// Normal pagination with Firestore query
		const offset = (page - 1) * pageSize;
		const usersSnapshot = await db
			.collection('users')
			.orderBy('createdAt', 'desc')
			.offset(offset)
			.limit(pageSize)
			.get();

		const totalSnapshot = await db.collection('users').count().get();
		const total = totalSnapshot.data().count;

		const users = usersSnapshot.docs.map((doc) => {
			const userData = doc.data();
			return convertFirestoreToUserDocument(doc.id, userData);
		});

		return {
			users,
			total,
			page,
			pageSize,
		};
	}
};

/**
 * Populate roles for users
 * Note: This function is kept simple to avoid circular dependencies.
 * Role population logic is handled here but imports are done in controller.
 */
export const populateUsersWithRoles = async (users: UserDocument[]): Promise<any[]> => {
	// Dynamic import to avoid circular dependency
	const roleHelper = require('../utils/helpers/role.helper');
	const { populateRole } = roleHelper;
	
	return await Promise.all(
		users.map(async (user) => {
			const role = await populateRole(user.roleId);
			return {
				...user,
				role,
			};
		}),
	);
};

/**
 * Get user by ID
 */
export const getUserByIdWithRole = async (userId: string): Promise<UserDocument | null> => {
	return await getUserDocument(userId);
};

/**
 * Update user role and sync with Firebase Auth
 */
export const updateUserRole = async (
	userId: string,
	roleId: string,
	updatedBy: string,
): Promise<{ user: UserDocument; roleName: string }> => {
	// Verify user exists
	const user = await getUserDocument(userId);
	if (!user) {
		throw createServiceError(ErrorMessage.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
	}

	// Verify role exists
	const roleDoc = await db.collection('roles').doc(roleId).get();
	if (!roleDoc.exists) {
		throw createServiceError(ErrorMessage.ROLE_NOT_FOUND, ErrorCode.ROLE_NOT_FOUND);
	}

	const roleData = roleDoc.data();
	const roleName = roleData?.name || 'USER';

	// Update user role
	const updatedUser = await updateUserDocument(userId, { roleId }, updatedBy);

	// Sync with Firebase Auth
	await auth.setCustomUserClaims(userId, { role: roleName });

	return {
		user: updatedUser,
		roleName,
	};
};

/**
 * Toggle user lock status and sync with Firebase Auth
 */
export const toggleUserLock = async (
	userId: string,
	isLocked: boolean,
	updatedBy: string,
): Promise<UserDocument> => {
	// Verify user exists
	const user = await getUserDocument(userId);
	if (!user) {
		throw createServiceError(ErrorMessage.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
	}

	// Update user lock status
	const updatedUser = await updateUserDocument(userId, { isLocked }, updatedBy);

	// Sync with Firebase Auth
	if (isLocked) {
		await auth.updateUser(userId, { disabled: true });
	} else {
		await auth.updateUser(userId, { disabled: false });
	}

	return updatedUser;
};

/**
 * Delete user from both Firestore and Firebase Auth
 */
export const deleteUserService = async (userId: string): Promise<void> => {
	// Verify user exists in Firestore
	const user = await getUserDocument(userId);
	if (!user) {
		throw new Error('User not found');
	}

	// Delete from Firestore
	await db.collection('users').doc(userId).delete();

	// Delete from Firebase Auth
	try {
		await auth.deleteUser(userId);
	} catch (error: any) {
		// If user not found in Auth, that's okay (Firestore already deleted)
		if (error.code !== ErrorCode.FIREBASE_USER_NOT_FOUND) {
			throw error;
		}
	}
};

