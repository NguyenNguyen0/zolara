import { NextFunction, Request, Response } from 'express';
import { auth, db } from '../configs/firebase';
import { AppError, AuthRequest, AuthResponse, SignupResponse } from '../types';
import { ok, created } from '../types/response';
import { createUserDocument, getUserDocument, updateUserDocument } from '../services/user.service';
import { signupSchema, loginSchema, refreshTokenSchema, validateRequest } from '../validations/auth.validation';
import { handleFirebaseAuthError } from '../utils/firebase-error.helper';
import { getRoleInfoFromUser } from '../utils/role.helper';

export const signup = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const validatedData = await validateRequest(signupSchema, req.body) as AuthRequest;
		const { email, password } = validatedData;

		const userRecord = await auth.createUser({
			email,
			password,
			emailVerified: false,
		});

		if (!userRecord.email) {
			return next(new AppError('User email is required', 500, 'INTERNAL_ERROR'));
		}

		const createdBy = req.user?.uid || userRecord.uid;

		const userRoleSnapshot = await db.collection('roles').where('name', '==', 'USER').limit(1).get();
		if (userRoleSnapshot.empty) {
			return next(
				new AppError('USER role not found. Please ensure roles are seeded.', 500, 'ROLE_NOT_FOUND'),
			);
		}

		const userRoleId = userRoleSnapshot.docs[0].id;
		const userRoleName = userRoleSnapshot.docs[0].data().name;

		const userDocument = await createUserDocument(userRecord.uid, {
			email: userRecord.email,
			firstName: '',
			lastName: '',
			enable: true,
			active: true,
			isOnline: false,
			lastSeen: new Date().toISOString(),
			roleId: userRoleId,
			dob: null,
			gender: null,
			typingTo: null,
			bio: null,
			avatar: null,
			createdBy,
		});

		await auth.setCustomUserClaims(userRecord.uid, { role: userRoleName });

		created(
			res,
			{
				id: userDocument.id,
				email: userDocument.email,
				roleId: userDocument.roleId,
				roleName: userRoleName,
			} as SignupResponse,
			`/api/users/${userRecord.uid}`,
		);
	} catch (error: any) {
		if (error instanceof AppError) {
			return next(error);
		}
		return next(handleFirebaseAuthError(error));
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const validatedData = await validateRequest(loginSchema, req.body) as AuthRequest;
		const { email } = validatedData;

		const userRecord = await auth.getUserByEmail(email);
		const customToken = await auth.createCustomToken(userRecord.uid);

		await updateUserDocument(userRecord.uid, {
			lastSeen: new Date().toISOString(),
			isOnline: true,
		}, userRecord.uid);

		const userDocument = await getUserDocument(userRecord.uid);
		if (!userDocument) {
			return next(new AppError('User document not found', 404, 'USER_NOT_FOUND'));
		}

		const { roleId, roleName } = await getRoleInfoFromUser(userRecord.uid);

		ok(res, {
			id: userDocument.id,
			email: userDocument.email,
			accessToken: customToken,
			roleId: userDocument.roleId,
			roleName,
		} as AuthResponse);
	} catch (error: any) {
		if (error instanceof AppError) {
			return next(error);
		}

		if (error.code === 'auth/user-not-found') {
			return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
		}

		return next(handleFirebaseAuthError(error));
	}
};

export const refreshToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const validatedData = await validateRequest(refreshTokenSchema, req.body);
		const { uid } = validatedData;

		// Verify user exists in Firebase Auth
		const userRecord = await auth.getUser(uid);

		// Verify user document exists in Firestore
		const userDocument = await getUserDocument(uid);
		if (!userDocument) {
			return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
		}

		// Check if user is active
		if (!userDocument.active) {
			return next(new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED'));
		}

		const customToken = await auth.createCustomToken(uid);

		ok(res, { accessToken: customToken });
	} catch (error: any) {
		if (error instanceof AppError) {
			return next(error);
		}
		return next(handleFirebaseAuthError(error));
	}
};

export const getMe = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		if (!req.user) {
			return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
		}

		const userDocument = await getUserDocument(req.user.uid);
		if (!userDocument) {
			return next(new AppError('User document not found', 404, 'USER_NOT_FOUND'));
		}

		const userRecord = await auth.getUser(req.user.uid);
		const { roleId, roleName } = await getRoleInfoFromUser(req.user.uid);

		ok(res, {
			id: userDocument.id,
			email: userDocument.email,
			roleId: userDocument.roleId,
			roleName,
			firstName: userDocument.firstName,
			lastName: userDocument.lastName,
			enable: userDocument.enable,
			active: userDocument.active,
			isOnline: userDocument.isOnline,
			lastSeen: userDocument.lastSeen,
			createdAt: userDocument.createdAt,
			createdBy: userDocument.createdBy,
			dob: userDocument.dob,
			gender: userDocument.gender,
			typingTo: userDocument.typingTo,
			bio: userDocument.bio,
			avatar: userDocument.avatar,
			updatedAt: userDocument.updatedAt,
			updatedBy: userDocument.updatedBy,
			emailVerified: userRecord.emailVerified || false,
		});
	} catch (error: any) {
		return next(error);
	}
};
