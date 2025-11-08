import { NextFunction, Request, Response } from 'express';
import { AppError } from '../types';

export function errorHandler(
	err: any,
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	const status = err instanceof AppError ? err.status : 500;

	const problem = {
		type: err.type || mapTypeFromStatus(status),
		title: err.title || httpStatusTitle(status),
		status,
		detail: err.message || 'An unexpected error occurred. Please try again later.',
		instance: req.originalUrl,
		...(err.code ? { code: err.code } : {}),
		...(err.extras ? err.extras : {}),
		traceId: res.locals.traceId || req.headers['x-request-id'] || 'unknown',
	};

	// Log error appropriately based on status code
	// Client errors (4xx) - log minimal info only (no stack trace)
	// Server errors (5xx) - log with stack trace in development only
	if (status >= 500) {
		// Server errors
		if (process.env.NODE_ENV === 'development') {
			console.error(
				`\n❌ [${status}] ${req.method} ${req.originalUrl}\n   Message: ${err.message}\n   TraceId: ${problem.traceId}`,
			);
			if (err.stack) {
				console.error(`   Stack:\n${err.stack.split('\n').slice(1).join('\n')}\n`);
			}
		} else {
			// Production - log minimal info
			console.error(
				`[${status}] ${req.method} ${req.originalUrl} - ${err.message} (TraceId: ${problem.traceId})`,
			);
		}
	} else {
		// Client errors (4xx) - log minimal info only, no stack trace
		console.error(
			`[${status}] ${req.method} ${req.originalUrl} - ${err.message} (TraceId: ${problem.traceId})`,
		);
	}

	res.status(status).json(problem);
}

function httpStatusTitle(status: number): string {
	const titles: Record<number, string> = {
		400: 'Bad Request',
		401: 'Unauthorized',
		403: 'Forbidden',
		404: 'Not Found',
		409: 'Conflict',
		422: 'Unprocessable Entity',
		429: 'Too Many Requests',
		500: 'Internal Server Error',
	};
	return titles[status] || 'Error';
}

function mapTypeFromStatus(status: number): string {
	const baseUrl = process.env.API_BASE_URL || 'https://api.zolara.com';
	const map: Record<number, string> = {
		400: `${baseUrl}/problems/validation-error`,
		401: `${baseUrl}/problems/unauthorized`,
		403: `${baseUrl}/problems/forbidden`,
		404: `${baseUrl}/problems/not-found`,
		409: `${baseUrl}/problems/conflict`,
		422: `${baseUrl}/problems/unprocessable-entity`,
		429: `${baseUrl}/problems/too-many-requests`,
		500: `${baseUrl}/problems/internal-error`,
	};
	return map[status] || `${baseUrl}/problems/error`;
}

