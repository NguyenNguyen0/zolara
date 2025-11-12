import { Response } from 'express';

export function ok<T>(
	res: Response,
	data: T,
	metaOrMessage?: Record<string, unknown> | string,
	links?: Record<string, string | undefined>,
) {
	const cleanLinks = links
		? Object.fromEntries(Object.entries(links).filter(([_, value]) => value !== undefined))
		: undefined;

	// Check if second parameter is a string (message) or object (meta)
	const message = typeof metaOrMessage === 'string' ? metaOrMessage : undefined;
	const meta = typeof metaOrMessage === 'object' ? metaOrMessage : undefined;

	return res.status(200).json({
		data,
		...(meta ? { meta } : {}),
		...(message ? { message } : {}),
		...(cleanLinks ? { links: cleanLinks as Record<string, string> } : {}),
		traceId: res.locals.traceId,
	});
}

export function created<T>(res: Response, data: T, messageOrLocation?: string) {
	// If it looks like a URL path, treat as location header
	if (messageOrLocation && messageOrLocation.startsWith('/')) {
		res.setHeader('Location', messageOrLocation);
		return res.status(201).json({
			data,
			traceId: res.locals.traceId,
		});
	}
	// Otherwise treat as message
	return res.status(201).json({
		data,
		...(messageOrLocation ? { message: messageOrLocation } : {}),
		traceId: res.locals.traceId,
	});
}

export function noContent(res: Response) {
	return res.status(204).send();
}

