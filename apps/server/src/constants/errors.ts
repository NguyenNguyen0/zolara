/**
 * Error codes and messages constants
 * Ensures consistency between error throwing and error handling
 */

export enum ErrorCode {
	// User errors
	USER_NOT_FOUND = 'USER_NOT_FOUND',
	USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
	USER_ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
	USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',

	// Role errors
	ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
	ROLE_ALREADY_EXISTS = 'ROLE_EXISTS',
	ROLE_IN_USE = 'ROLE_IN_USE',

	// Permission errors
	PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',
	PERMISSION_ALREADY_EXISTS = 'PERMISSION_EXISTS',
	PERMISSION_IN_USE = 'PERMISSION_IN_USE',

	// Auth errors
	AUTH_REQUIRED = 'UNAUTHORIZED',
	AUTH_FAILED = 'AUTH_FAILED',
	TOKEN_EXPIRED = 'TOKEN_EXPIRED',
	INVALID_TOKEN = 'INVALID_TOKEN',
	FORBIDDEN = 'FORBIDDEN',

	// Firebase Auth errors
	FIREBASE_USER_NOT_FOUND = 'auth/user-not-found',
	FIREBASE_TOKEN_EXPIRED = 'auth/id-token-expired',

	// Validation errors
	VALIDATION_ERROR = 'VALIDATION',

	// Generic errors
	DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
	OPERATION_FAILED = 'OPERATION_FAILED',
}

export enum ErrorMessage {
	USER_NOT_FOUND = 'User not found',
	USER_ALREADY_EXISTS = 'User already exists',
	USER_ACCOUNT_LOCKED = 'Account is locked',
	USER_UPDATE_FAILED = 'User document not found after update',

	ROLE_NOT_FOUND = 'Role not found',
	ROLE_ALREADY_EXISTS = 'Role with this name already exists',
	ROLE_IN_USE = 'Cannot delete role that is assigned to users. Please reassign users first.',

	PERMISSION_NOT_FOUND = 'Permission not found',
	PERMISSION_ALREADY_EXISTS = 'Permission already exists for this API path and method',
	PERMISSION_IN_USE = 'Cannot delete permission that is assigned to roles. Please remove it from roles first.',

	AUTH_REQUIRED = 'Authentication required',
	AUTH_FAILED = 'Authentication failed',
	TOKEN_EXPIRED = 'Token has expired',
	INVALID_TOKEN = 'Invalid token',
	FORBIDDEN = 'Access denied',

	DOCUMENT_NOT_FOUND = 'Document not found after update',
	OPERATION_FAILED = 'Operation failed',
}

/**
 * Check if error matches a specific error code or message
 */
export const isError = (error: any, codeOrMessage: string): boolean => {
	if (!error) return false;

	// Check error code
	if (error.code === codeOrMessage) return true;

	// Check error message
	if (error.message === codeOrMessage) return true;

	// Check if it's an AppError with specific code
	if (error.code && error.code === codeOrMessage) return true;

	return false;
};

/**
 * Create consistent error object
 */
export const createServiceError = (message: string, code: ErrorCode): Error => {
	const error = new Error(message);
	(error as any).code = code;
	return error;
};
