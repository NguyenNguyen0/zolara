import { Request, Response } from 'express';
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export const getRtcToken = (req: Request, res: Response) => {
	const { channelName } = req.query;
	const uid = req.query.uid || 0;
	const role =
		req.query.role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

	if (!channelName) {
		return res.status(400).json({ error: 'channelName is required' });
	}

	// Get the app ID and certificate from environment variables
	const appID = process.env.AGORA_APP_ID;
	const appCertificate = process.env.AGORA_APP_CERTIFICATE;

	if (!appID || !appCertificate) {
		return res
			.status(500)
			.json({ error: 'Agora credentials not configured' });
	}

	// Set token expiration time (in seconds)
	const expirationTimeInSeconds = 3600; // 1 hour
	const currentTimestamp = Math.floor(Date.now() / 1000);
	const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

	// Build the token
	const token = RtcTokenBuilder.buildTokenWithUid(
		appID,
		appCertificate,
		channelName.toString(),
		Number(uid),
		role,
		privilegeExpiredTs,
	);

	return res.json({ token });
};
