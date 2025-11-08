import { NextFunction, Response } from 'express';
import { AppError } from '../types';

/**
 * Helper to handle errors in controllers
 * Wraps error handling logic to reduce repetition
 */
export const handleControllerError = (
	error: any,
	next: NextFunction,
): void => {
	if (error instanceof AppError) {
		return next(error);
	}
	return next(error);
};

/**
 * Async handler wrapper to catch errors automatically
 */
export const asyncHandler = (fn: Function) => {
	return (req: any, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

