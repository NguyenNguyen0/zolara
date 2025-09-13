import { Request, Response, NextFunction } from 'express';

/**
 * Simplified logger middleware for testing
 * @returns Express middleware function
 */
export const logger = (
	config: { logHeader: boolean; logBody: boolean } = {
		logHeader: false,
		logBody: false,
	},
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		// Skip logging in tests to avoid clutter
		next();
	};
};
