import { AppError } from '../types';
import { ErrorCode } from '../constants/errors';

/**
 * Handle friend service errors and convert to appropriate HTTP errors
 */
export const handleFriendServiceError = (
	error: any,
	context?: { requestId?: string; friendId?: string },
): AppError => {
	// If already an AppError, return it
	if (error instanceof AppError) {
		return error;
	}

	// Handle Firebase errors
	if (error.code) {
		switch (error.code) {
			case ErrorCode.NOT_FOUND:
				return new AppError(
					error.message || 'Friend request not found',
					404,
					ErrorCode.NOT_FOUND,
				);
			case ErrorCode.FORBIDDEN:
				return new AppError(
					error.message || 'You do not have permission to perform this action',
					403,
					ErrorCode.FORBIDDEN,
				);
			case ErrorCode.VALIDATION_ERROR:
				return new AppError(
					error.message || 'Validation error',
					400,
					ErrorCode.VALIDATION_ERROR,
				);
			case ErrorCode.USER_NOT_FOUND:
				return new AppError(
					'User not found',
					404,
					ErrorCode.USER_NOT_FOUND,
				);
		}
	}

	// Handle Joi validation errors
	if (error.isJoi || error.name === 'ValidationError') {
		return new AppError(
			error.message || 'Invalid request data',
			400,
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Default error
	return new AppError(
		error.message || 'An error occurred while processing friend request',
		500,
		ErrorCode.INTERNAL_SERVER_ERROR,
	);
};
