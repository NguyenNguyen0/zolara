import express from 'express';
import { getTopics, getChat, getChatStream } from '../controllers/agent.controller';

const router = express.Router();

/**
 * @swagger
 * /api/v1/agent/topics:
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
 * /api/v1/agent/chat:
 *   get:
 *     summary: Get AI chat response
 *     tags: [Agent]
 *     parameters:
 *       - in: query
 *         name: userMessage
 *         required: true
 *         schema:
 *           type: string
 *         description: User's message
 *       - in: query
 *         name: history
 *         schema:
 *           type: string
 *         description: JSON string of conversation history
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
router.get('/chat', getChat);

/**
 * @swagger
 * /api/v1/agent/chat-stream:
 *   get:
 *     summary: Get streaming AI chat response
 *     tags: [Agent]
 *     parameters:
 *       - in: query
 *         name: userMessage
 *         required: true
 *         schema:
 *           type: string
 *         description: User's message
 *       - in: query
 *         name: history
 *         schema:
 *           type: string
 *         description: JSON string of conversation history
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
router.get('/chat-stream', getChatStream);

export default router;
