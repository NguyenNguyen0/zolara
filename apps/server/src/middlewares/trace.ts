import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export function attachTraceId(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	res.locals.traceId =
		(req.headers['x-request-id'] as string) || randomUUID();
	next();
}

