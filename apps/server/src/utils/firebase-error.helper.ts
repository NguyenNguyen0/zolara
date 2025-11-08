import { AppError } from '../types';

/**
 * Handle Firebase Auth errors and convert to AppError
 */
export const handleFirebaseAuthError = (error: any): AppError => {
	const errorCode = error.code || '';

	switch (errorCode) {
		case 'auth/email-already-exists':
			return new AppError('Email already exists', 409, 'EMAIL_EXISTS', {
				errors: [
					{
						field: 'email',
						code: 'duplicate',
						message: 'Email already exists',
					},
				],
			});

		case 'auth/invalid-email':
			return new AppError('Invalid email format', 400, 'VALIDATION', {
				errors: [
					{
						field: 'email',
						code: 'format',
						message: 'Invalid email format',
					},
				],
			});

		case 'auth/user-not-found':
			return new AppError('User not found', 404, 'USER_NOT_FOUND');

		case 'auth/id-token-expired':
			return new AppError('Token has expired', 401, 'TOKEN_EXPIRED');

		case 'auth/id-token-revoked':
		case 'auth/invalid-id-token':
			return new AppError('Invalid token', 401, 'INVALID_TOKEN');

		case 'auth/argument-error':
			if (error.message?.includes('custom token')) {
				return new AppError('Invalid custom token format', 401, 'INVALID_TOKEN');
			}
			return new AppError('Invalid token format', 401, 'INVALID_TOKEN');

		default:
			return new AppError(
				error.message || 'An unexpected error occurred',
				500,
				'INTERNAL_ERROR',
			);
	}
};

