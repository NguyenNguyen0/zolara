import { AppError } from '../types/app-error';
import { ErrorCode, ErrorMessage, isError } from '../constants/errors';

/**
 * Handle auth service errors and convert to AppError
 */
export const handleAuthServiceError = (error: any, context?: { uid?: string }): AppError => {
	// If it's already an AppError, return it
	if (error instanceof AppError) {
		return error;
	}

	// Check error code first
	if (error.code) {
		switch (error.code) {
			case ErrorCode.USER_NOT_FOUND:
				return new AppError(ErrorMessage.USER_NOT_FOUND, 404, ErrorCode.USER_NOT_FOUND);
			case ErrorCode.ROLE_NOT_FOUND:
				return new AppError(ErrorMessage.ROLE_NOT_FOUND, 404, ErrorCode.ROLE_NOT_FOUND);
			case ErrorCode.USER_ACCOUNT_LOCKED:
				return new AppError(ErrorMessage.USER_ACCOUNT_LOCKED, 403, ErrorCode.USER_ACCOUNT_LOCKED);
			case ErrorCode.OPERATION_FAILED:
				return new AppError(ErrorMessage.OPERATION_FAILED, 500, ErrorCode.OPERATION_FAILED);
			default:
				break;
		}
	}

	// Check error message
	if (error.message) {
		if (isError(error, ErrorMessage.USER_NOT_FOUND)) {
			return new AppError(ErrorMessage.USER_NOT_FOUND, 404, ErrorCode.USER_NOT_FOUND);
		}
		if (isError(error, ErrorMessage.ROLE_NOT_FOUND)) {
			return new AppError(ErrorMessage.ROLE_NOT_FOUND, 404, ErrorCode.ROLE_NOT_FOUND);
		}
		if (isError(error, ErrorMessage.USER_ACCOUNT_LOCKED)) {
			return new AppError(ErrorMessage.USER_ACCOUNT_LOCKED, 403, ErrorCode.USER_ACCOUNT_LOCKED);
		}
	}

	// Check Firebase Auth error codes
	if (error.code === 'auth/user-not-found' || error.code === ErrorCode.FIREBASE_USER_NOT_FOUND) {
		return new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
	}

	// Default error
	return new AppError(error.message || ErrorMessage.OPERATION_FAILED, 500, ErrorCode.OPERATION_FAILED);
};

