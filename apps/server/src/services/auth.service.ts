import { auth, db } from '../configs/firebase';
import { UserDocument, UserCreateData } from '../types/user';
import { AuthRequest, AuthResponse, SignupResponse } from '../types';
import {
	createUserDocument,
	getUserDocument,
	updateUserDocument,
} from './user.service';
import { getRoleInfoFromUser } from '../utils/helpers';
import {
	ErrorCode,
	ErrorMessage,
	createServiceError,
} from '../constants/errors';

/**
 * Sign up a new user
 */
export const signupService = async (
	email: string,
	password: string,
	createdBy: string,
): Promise<SignupResponse> => {
	// Create user in Firebase Auth
	const userRecord = await auth.createUser({
		email,
		password,
		emailVerified: false,
	});

	if (!userRecord.email) {
		throw createServiceError(
			'User email is required',
			ErrorCode.OPERATION_FAILED,
		);
	}

	// Get USER role
	const userRoleSnapshot = await db
		.collection('roles')
		.where('name', '==', 'USER')
		.limit(1)
		.get();
	if (userRoleSnapshot.empty) {
		throw createServiceError(
			'USER role not found. Please ensure roles are seeded.',
			ErrorCode.ROLE_NOT_FOUND,
		);
	}

	const userRoleId = userRoleSnapshot.docs[0].id;
	const userRoleName = userRoleSnapshot.docs[0].data().name;

	// Create user document in Firestore
	const userDocument = await createUserDocument(userRecord.uid, {
		email: userRecord.email,
		firstName: '',
		lastName: '',
		isLocked: false,
		isActive: false,
		lastActivity: new Date(),
		roleId: userRoleId,
		dob: null,
		gender: null,
		bio: null,
		avatar: null,
		createdBy,
	});

	// Set custom claims
	await auth.setCustomUserClaims(userRecord.uid, { role: userRoleName });

	return {
		id: userDocument.id,
		email: userDocument.email,
		roleId: userDocument.roleId,
		roleName: userRoleName,
	};
};

/**
 * Login user and generate access token
 */
export const loginService = async (email: string): Promise<AuthResponse> => {
	// Get user from Firebase Auth
	const userRecord = await auth.getUserByEmail(email);

	// Generate custom token
	const customToken = await auth.createCustomToken(userRecord.uid);

	// Update user activity
	await updateUserDocument(
		userRecord.uid,
		{
			lastActivity: new Date(),
			isActive: true,
		},
		userRecord.uid,
	);

	// Get user document
	const userDocument = await getUserDocument(userRecord.uid);
	if (!userDocument) {
		throw createServiceError(
			ErrorMessage.USER_NOT_FOUND,
			ErrorCode.USER_NOT_FOUND,
		);
	}

	// Get role info
	const { roleId, roleName } = await getRoleInfoFromUser(userRecord.uid);

	return {
		id: userDocument.id,
		email: userDocument.email,
		accessToken: customToken,
		roleId: userDocument.roleId,
		roleName,
	};
};

/**
 * Refresh access token
 */
export const refreshTokenService = async (
	uid: string,
): Promise<{ accessToken: string }> => {
	// Verify user exists in Firebase Auth
	await auth.getUser(uid);

	// Verify user document exists in Firestore
	const userDocument = await getUserDocument(uid);
	if (!userDocument) {
		throw createServiceError(
			ErrorMessage.USER_NOT_FOUND,
			ErrorCode.USER_NOT_FOUND,
		);
	}

	// Check if user is locked
	if (userDocument.isLocked) {
		throw createServiceError(
			ErrorMessage.USER_ACCOUNT_LOCKED,
			ErrorCode.USER_ACCOUNT_LOCKED,
		);
	}

	// Generate new custom token
	const customToken = await auth.createCustomToken(uid);

	return { accessToken: customToken };
};

/**
 * Get current user profile
 */
export const getMeService = async (uid: string): Promise<any> => {
	// Get user document
	const userDocument = await getUserDocument(uid);
	if (!userDocument) {
		throw createServiceError(
			ErrorMessage.USER_NOT_FOUND,
			ErrorCode.USER_NOT_FOUND,
		);
	}

	// Get user record from Firebase Auth
	const userRecord = await auth.getUser(uid);

	// Get role info
	const { roleId, roleName } = await getRoleInfoFromUser(uid);

	return {
		id: userDocument.id,
		email: userDocument.email,
		roleId: userDocument.roleId,
		roleName,
		firstName: userDocument.firstName,
		lastName: userDocument.lastName,
		isLocked: userDocument.isLocked,
		isActive: userDocument.isActive,
		lastActivity: userDocument.lastActivity,
		createdAt: userDocument.createdAt,
		createdBy: userDocument.createdBy,
		dob: userDocument.dob,
		gender: userDocument.gender,
		bio: userDocument.bio,
		avatar: userDocument.avatar,
		updatedAt: userDocument.updatedAt,
		updatedBy: userDocument.updatedBy,
		emailVerified: userRecord.emailVerified || false,
	};
};
