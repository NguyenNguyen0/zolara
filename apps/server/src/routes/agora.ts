import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { router } from 'expo-router';
import { getRtcToken } from '../controllers/agora.controller';

export const agoraRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Agora
 *   description: Agora management endpoints
 */
agoraRouter.use(authMiddleware());

/**
 * @swagger
 * /api/agora/token:
 *   get:
 *     summary: Generate an Agora token for video/voice calling
 *     tags: [Agora]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: channelName
 *         required: true
 *         schema:
 *           type: string
 *         description: The channel name to join
 *       - in: query
 *         name: uid
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID (defaults to 0)
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [publisher, subscriber]
 *         description: Role in the channel (defaults to publisher)
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
agoraRouter.get('/token', getRtcToken);
