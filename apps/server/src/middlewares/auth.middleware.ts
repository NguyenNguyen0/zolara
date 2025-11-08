import { NextFunction, Request, Response } from 'express';
import { auth, db } from '../configs/firebase';
import { AppError } from '../types';
import '../types/express';

/**
 * Middleware to verify Firebase ID token and attach user info to request
 */
export const verifyAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		// Get token from header or body
		const authHeader = req.headers.authorization;
		const token =
			authHeader?.startsWith('Bearer ')
				? authHeader.split('Bearer ')[1]
				: req.body?.idToken || req.body?.token;

		if (!token) {
			return next(
				new AppError('Authentication token is required', 401, 'UNAUTHORIZED'),
			);
		}

		// Try to verify as ID token first
		let decodedToken: any;
		let uid: string;

		try {
			decodedToken = await auth.verifyIdToken(token);
			uid = decodedToken.uid;
		} catch (idTokenError: any) {
			// If it's a custom token, decode it
			if (
				idTokenError.code === 'auth/argument-error' &&
				idTokenError.message?.includes('custom token')
			) {
				try {
					const parts = token.split('.');
					if (parts.length !== 3) {
						return next(new AppError('Invalid token format', 401, 'INVALID_TOKEN'));
					}

					const payload = JSON.parse(
						Buffer.from(parts[1], 'base64url').toString('utf-8'),
					);

					if (!payload || !payload.uid) {
						return next(new AppError('Invalid token format', 401, 'INVALID_TOKEN'));
					}

					uid = payload.uid;
				} catch (decodeError) {
					return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
				}
			} else {
				if (idTokenError.code === 'auth/id-token-expired') {
					return next(new AppError('Token has expired', 401, 'TOKEN_EXPIRED'));
				}
				return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
			}
		}

		// Get user data from Firestore to get role
		const userDoc = await db.collection('users').doc(uid).get();

		if (!userDoc.exists) {
			return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
		}

		const userData = userDoc.data();
		const roleId = userData?.roleId;

		// Get role data from roleId
		let roleName = 'USER';
		let permissions: string[] = [];
		if (roleId) {
			const roleDoc = await db.collection('roles').doc(roleId).get();
			if (roleDoc.exists) {
				const roleData = roleDoc.data();
				roleName = roleData?.name || 'USER';
				permissions = roleData?.permissionIds || [];
			}
		}

		// Check if user is locked (unless admin)
		if (userData?.isLocked === true && roleName !== 'ADMIN') {
			return next(
				new AppError('Account is locked', 403, 'ACCOUNT_LOCKED'),
			);
		}

		// Attach user info to request
		req.user = {
			uid,
			email: userData?.email || '',
			roleId: roleId || null,
			role: roleName, // Keep role name for backward compatibility
			permissions,
		};

		next();
	} catch (error: any) {
		return next(new AppError('Authentication failed', 401, 'AUTH_FAILED'));
	}
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	if (!req.user) {
		return next(
			new AppError('Authentication required', 401, 'UNAUTHORIZED'),
		);
	}

	if (req.user.role !== 'ADMIN') {
		return next(
			new AppError('Access denied', 403, 'FORBIDDEN'),
		);
	}

	next();
};

/**
 * Middleware to check if user has permission for the requested API
 * This middleware checks if the user's role has the required permission
 * based on the API path and HTTP method
 */
export const requirePermission = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		if (!req.user) {
			return next(
				new AppError('Authentication required', 401, 'UNAUTHORIZED'),
			);
		}

		// Admin always has access to everything
		if (req.user.role === 'ADMIN') {
			return next();
		}

		// Get API path and method
		const apiPath = req.path; // e.g., /api/users
		const method = req.method.toUpperCase(); // GET, POST, etc.

		// Normalize path: replace route params with {id}
		let normalizedPath = apiPath;
		// Replace UUIDs and IDs with {id} pattern
		normalizedPath = normalizedPath.replace(/\/[a-f0-9-]{20,}/gi, '/{id}');
		// Remove trailing slash
		normalizedPath = normalizedPath.replace(/\/$/, '');

		// Find permission for this API path and method
		const permissionSnapshot = await db
			.collection('permissions')
			.where('apiPath', '==', normalizedPath)
			.where('method', '==', method)
			.where('active', '==', true)
			.limit(1)
			.get();

		if (permissionSnapshot.empty) {
			// If no permission defined, allow access (backward compatibility)
			// Or you can deny access by uncommenting below:
			// return next(new AppError('Permission not defined for this API', 403, 'PERMISSION_NOT_DEFINED'));
			return next();
		}

		const permissionId = permissionSnapshot.docs[0].id;

		// Check if user's role has this permission
		const userPermissions = req.user.permissions || [];

		if (!userPermissions.includes(permissionId)) {
			return next(
				new AppError(
					'You do not have permission to access this resource',
					403,
					'PERMISSION_DENIED',
				),
			);
		}

		next();
	} catch (error: any) {
		return next(new AppError('Permission check failed', 500, 'PERMISSION_CHECK_FAILED'));
	}
};

/**
 * Middleware to check if user has specific role(s)
 */
export const requireRole = (...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			return next(
				new AppError('Authentication required', 401, 'UNAUTHORIZED'),
			);
		}

		if (!roles.includes(req.user.role)) {
			return next(
				new AppError(
					`Access denied. Required role: ${roles.join(' or ')}`,
					403,
					'FORBIDDEN',
				),
			);
		}

		next();
	};
};

