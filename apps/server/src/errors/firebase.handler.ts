import { AppError } from '../types/app-error';
import { ErrorCode, ErrorMessage } from '../constants/errors';

/**
 * Handle Firebase Auth errors and convert to AppError
 * Maps Firebase-specific error codes to application error codes
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
			return new AppError('Invalid email format', 400, ErrorCode.VALIDATION_ERROR, {
				errors: [
					{
						field: 'email',
						code: 'format',
						message: 'Invalid email format',
					},
				],
			});

		case 'auth/user-not-found':
			return new AppError(ErrorMessage.USER_NOT_FOUND, 404, ErrorCode.USER_NOT_FOUND);

		case 'auth/id-token-expired':
			return new AppError(ErrorMessage.TOKEN_EXPIRED, 401, ErrorCode.TOKEN_EXPIRED);

		case 'auth/id-token-revoked':
		case 'auth/invalid-id-token':
			return new AppError(ErrorMessage.INVALID_TOKEN, 401, ErrorCode.INVALID_TOKEN);

		case 'auth/argument-error':
			if (error.message?.includes('custom token')) {
				return new AppError('Invalid custom token format', 401, ErrorCode.INVALID_TOKEN);
			}
			return new AppError('Invalid token format', 401, ErrorCode.INVALID_TOKEN);

		default:
			return new AppError(
				error.message || ErrorMessage.OPERATION_FAILED,
				500,
				ErrorCode.OPERATION_FAILED,
			);
	}
};

