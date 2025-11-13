import express from 'express';
import { getTopics, getChat, getChatStream } from '../controllers/agent.controller';

const router = express.Router();

/**
 * @swagger
 * /api/agent/topics:
 *   get:
 *     summary: Get suggested discussion topics
 *     tags: [Agent]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           default: 3
 *         description: Number of topics to return
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *           default: "tin tức, drama"
 *         description: Topic category preference
 *     responses:
 *       200:
 *         description: List of suggested topics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topics:
 *                   type: array
 *                   items:
 *                     type: string
 *                 fallback:
 *                   type: boolean
 */
router.get('/topics', getTopics);

/**
 * @swagger
 * /api/agent/chat:
 *   post:
 *     summary: Get AI chat response
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userMessage
 *             properties:
 *               userMessage:
 *                 type: string
 *                 description: User's message
 *               history:
 *                 type: array
 *                 description: Conversation history
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userMessage:
 *                   type: string
 *                 response:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 conversationLength:
 *                   type: number
 *       400:
 *         description: Bad request
 */
router.post('/chat', getChat);

/**
 * @swagger
 * /api/agent/chat-stream:
 *   post:
 *     summary: Get streaming AI chat response
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userMessage
 *             properties:
 *               userMessage:
 *                 type: string
 *                 description: User's message
 *               history:
 *                 type: array
 *                 description: Conversation history
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Server-sent events stream
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       400:
 *         description: Bad request
 */
router.post('/chat-stream', getChatStream);

export default router;
 