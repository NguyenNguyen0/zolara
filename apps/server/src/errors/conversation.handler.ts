import { AppError } from '../types/app-error';
import { ErrorCode } from '../constants/errors';

export const handleConversationServiceError = (
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
					'Conversation not found',
					404,
					ErrorCode.NOT_FOUND,
					context,
				);
			case 'permission-denied':
				return new AppError(
					'Permission denied to access conversation',
					403,
					ErrorCode.FORBIDDEN,
					context,
				);
			case 'already-exists':
				return new AppError(
					'Conversation already exists',
					409,
					ErrorCode.VALIDATION_ERROR,
					context,
				);
			default:
				break;
		}
	}

	// Default error
	return new AppError(
		error.message || 'An error occurred in conversation service',
		500,
		ErrorCode.INTERNAL_SERVER_ERROR,
		context,
	);
};
