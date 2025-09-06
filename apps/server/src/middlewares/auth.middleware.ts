import { Request, Response } from 'express';
import { admin } from '../configs/firebase.config';

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: Function,
) => {
	const authHeader = req.headers.authorization || '';
	const match = authHeader.match(/^Bearer (.+)$/);

	if (!match) {
		return res
			.status(401)
			.json({ error: 'No authorization token provided' });
	}

	const token = match[1];
	try {
		const decoded = await admin.auth().verifyIdToken(token);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ error: 'Invalid token' });
	}
};
