import { AppError } from '../types/app-error';
import { ErrorCode } from '../constants/errors';

export const handleMessageServiceError = (
	error: any,
	context?: Record<string, any>,
): AppError => {
	// If it's already an AppError, return it
	if (error instanceof AppError) {
		return error;
	}

	// Handle Firestore errors
	if (error.code) {
		switch (error.code) {
			case 'not-found':
				return new AppError(
					'Message not found',
					404,
					ErrorCode.NOT_FOUND,
					context,
				);
			case 'permission-denied':
				return new AppError(
					'Permission denied to access message',
					403,
					ErrorCode.FORBIDDEN,
					context,
				);
			default:
				break;
		}
	}

	// Default error
	return new AppError(
		error.message || 'An error occurred in message service',
		500,
		ErrorCode.INTERNAL_SERVER_ERROR,
		context,
	);
};
