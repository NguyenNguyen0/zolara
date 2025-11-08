import { Response } from 'express';

export function ok<T>(
	res: Response,
	data: T,
	meta?: Record<string, unknown>,
	links?: Record<string, string | undefined>,
) {
	const cleanLinks = links
		? Object.fromEntries(Object.entries(links).filter(([_, value]) => value !== undefined))
		: undefined;

	return res.status(200).json({
		data,
		...(meta ? { meta } : {}),
		...(cleanLinks ? { links: cleanLinks as Record<string, string> } : {}),
		traceId: res.locals.traceId,
	});
}

export function created<T>(res: Response, data: T, location?: string) {
	if (location) {
		res.setHeader('Location', location);
	}
	return res.status(201).json({
		data,
		traceId: res.locals.traceId,
	});
}

export function noContent(res: Response) {
	return res.status(204).send();
}

