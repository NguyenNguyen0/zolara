import { AppError } from '../types/app-error';
import { ErrorCode, ErrorMessage, isError } from '../constants/errors';

/**
 * Handle permission service errors and convert to AppError
 */
export const handlePermissionServiceError = (error: any, context?: { id?: string }): AppError => {
	// If it's already an AppError, return it
	if (error instanceof AppError) {
		return error;
	}

	// Check error code first
	if (error.code) {
		switch (error.code) {
			case ErrorCode.PERMISSION_NOT_FOUND:
				return new AppError(
					context?.id ? `Permission with id=${context.id} not found` : ErrorMessage.PERMISSION_NOT_FOUND,
					404,
					ErrorCode.PERMISSION_NOT_FOUND,
				);
			case ErrorCode.PERMISSION_ALREADY_EXISTS:
				return new AppError(ErrorMessage.PERMISSION_ALREADY_EXISTS, 409, ErrorCode.PERMISSION_ALREADY_EXISTS);
			case ErrorCode.PERMISSION_IN_USE:
				return new AppError(ErrorMessage.PERMISSION_IN_USE, 409, ErrorCode.PERMISSION_IN_USE);
			case ErrorCode.DOCUMENT_NOT_FOUND:
				return new AppError(ErrorMessage.DOCUMENT_NOT_FOUND, 404, ErrorCode.DOCUMENT_NOT_FOUND);
			default:
				break;
		}
	}

	// Check error message
	if (error.message) {
		if (isError(error, ErrorMessage.PERMISSION_NOT_FOUND)) {
			return new AppError(
				context?.id ? `Permission with id=${context.id} not found` : ErrorMessage.PERMISSION_NOT_FOUND,
				404,
				ErrorCode.PERMISSION_NOT_FOUND,
			);
		}
		if (isError(error, ErrorMessage.PERMISSION_ALREADY_EXISTS)) {
			return new AppError(ErrorMessage.PERMISSION_ALREADY_EXISTS, 409, ErrorCode.PERMISSION_ALREADY_EXISTS);
		}
		if (isError(error, ErrorMessage.PERMISSION_IN_USE)) {
			return new AppError(ErrorMessage.PERMISSION_IN_USE, 409, ErrorCode.PERMISSION_IN_USE);
		}
	}

	// Default error
	return new AppError(error.message || ErrorMessage.OPERATION_FAILED, 500, ErrorCode.OPERATION_FAILED);
};

