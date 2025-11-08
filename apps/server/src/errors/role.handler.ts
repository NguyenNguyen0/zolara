import { AppError } from '../types/app-error';
import { ErrorCode, ErrorMessage, isError } from '../constants/errors';

/**
 * Handle role service errors and convert to AppError
 */
export const handleRoleServiceError = (error: any, context?: { id?: string }): AppError => {
	// If it's already an AppError, return it
	if (error instanceof AppError) {
		return error;
	}

	// Check error code first
	if (error.code) {
		switch (error.code) {
			case ErrorCode.ROLE_NOT_FOUND:
				return new AppError(
					context?.id ? `Role with id=${context.id} not found` : ErrorMessage.ROLE_NOT_FOUND,
					404,
					ErrorCode.ROLE_NOT_FOUND,
				);
			case ErrorCode.ROLE_ALREADY_EXISTS:
				return new AppError(ErrorMessage.ROLE_ALREADY_EXISTS, 409, ErrorCode.ROLE_ALREADY_EXISTS);
			case ErrorCode.ROLE_IN_USE:
				return new AppError(ErrorMessage.ROLE_IN_USE, 409, ErrorCode.ROLE_IN_USE);
			case ErrorCode.DOCUMENT_NOT_FOUND:
				return new AppError(ErrorMessage.DOCUMENT_NOT_FOUND, 404, ErrorCode.DOCUMENT_NOT_FOUND);
			default:
				break;
		}
	}

	// Check error message
	if (error.message) {
		if (isError(error, ErrorMessage.ROLE_NOT_FOUND)) {
			return new AppError(
				context?.id ? `Role with id=${context.id} not found` : ErrorMessage.ROLE_NOT_FOUND,
				404,
				ErrorCode.ROLE_NOT_FOUND,
			);
		}
		if (isError(error, ErrorMessage.ROLE_ALREADY_EXISTS)) {
			return new AppError(ErrorMessage.ROLE_ALREADY_EXISTS, 409, ErrorCode.ROLE_ALREADY_EXISTS);
		}
		if (isError(error, ErrorMessage.ROLE_IN_USE)) {
			return new AppError(ErrorMessage.ROLE_IN_USE, 409, ErrorCode.ROLE_IN_USE);
		}
	}

	// Default error
	return new AppError(error.message || ErrorMessage.OPERATION_FAILED, 500, ErrorCode.OPERATION_FAILED);
};

