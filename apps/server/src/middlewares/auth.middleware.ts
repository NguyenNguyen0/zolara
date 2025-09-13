import { Request, Response } from 'express';
import { admin } from '../configs/firebase.config';
import { log } from 'console';

export const authMiddleware = (
	config: { optionalAuth: boolean } = { optionalAuth: false },
) => {
	return async (req: Request, res: Response, next: Function) => {
		const authHeader = req.headers.authorization || '';
		const match = authHeader.match(/^Bearer (.+)$/);

		if (!match && config.optionalAuth) {
			return next();
		}

		if (!match && !config.optionalAuth) {
			return res
				.status(401)
				.json({ error: 'No authorization token provided' });
		}

		try {
			const token = match![1];
			const decoded = await admin.auth().verifyIdToken(token);
			req.user = decoded;
			next();
		} catch (error) {
			console.log(error);

			if (config.optionalAuth) {
				return next();
			} else {
				return res.status(401).json({ error: 'Invalid token' });
			}
		}
	};
};
