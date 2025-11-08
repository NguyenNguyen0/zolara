import { AppError } from '../types/app-error';
import { ErrorCode, ErrorMessage, isError } from '../constants/errors';

/**
 * Handle user service errors and convert to AppError
 */
export const handleUserServiceError = (error: any, context?: { id?: string }): AppError => {
	// If it's already an AppError, return it
	if (error instanceof AppError) {
		return error;
	}

	// Check error code first
	if (error.code) {
		switch (error.code) {
			case ErrorCode.USER_NOT_FOUND:
				return new AppError(
					context?.id ? `User with id=${context.id} not found` : ErrorMessage.USER_NOT_FOUND,
					404,
					ErrorCode.USER_NOT_FOUND,
				);
			case ErrorCode.FIREBASE_USER_NOT_FOUND:
				return new AppError(ErrorMessage.USER_NOT_FOUND, 404, ErrorCode.USER_NOT_FOUND);
			case ErrorCode.DOCUMENT_NOT_FOUND:
				return new AppError(ErrorMessage.DOCUMENT_NOT_FOUND, 404, ErrorCode.DOCUMENT_NOT_FOUND);
			case ErrorCode.USER_UPDATE_FAILED:
				return new AppError(ErrorMessage.USER_UPDATE_FAILED, 500, ErrorCode.USER_UPDATE_FAILED);
			default:
				break;
		}
	}

	// Check error message
	if (error.message) {
		if (isError(error, ErrorMessage.USER_NOT_FOUND)) {
			return new AppError(
				context?.id ? `User with id=${context.id} not found` : ErrorMessage.USER_NOT_FOUND,
				404,
				ErrorCode.USER_NOT_FOUND,
			);
		}
	}

	// Check Firebase Auth error codes (string format from Firebase)
	if (error.code === 'auth/user-not-found' || error.code === ErrorCode.FIREBASE_USER_NOT_FOUND) {
		return new AppError('User not found in Firebase Auth', 404, ErrorCode.USER_NOT_FOUND);
	}

	// Default error
	return new AppError(error.message || ErrorMessage.OPERATION_FAILED, 500, ErrorCode.OPERATION_FAILED);
};

