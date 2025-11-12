/**
 * Centralized exports for all error handlers
 */
export * from './auth.handler';
export * from './user.handler';
export * from './role.handler';
export * from './permission.handler';
export * from './firebase.handler';
export * from './friend.handler';

// Re-export for backward compatibility
export { handleUserServiceError as handleServiceError } from './user.handler';

