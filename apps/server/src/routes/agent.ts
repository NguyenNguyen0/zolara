import express from 'express';
import { generateTopics, getTopics, getChat, getChatStream } from '../controllers/agent.controller';

const router = express.Router();

/**
 * @swagger
 * /api/agent/topics:
 *   post:
 *     summary: Generate and store new discussion topics
 *     tags: [Agent]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 minimum: 10
 *                 maximum: 20
 *                 default: 10
 *                 description: Number of topics to generate
 *     responses:
 *       200:
 *         description: Topics generated and stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 generatedCount:
 *                   type: number
 *                 totalCount:
 *                   type: number
 *       500:
 *         description: Failed to generate topics
 */
router.post('/topics', generateTopics);

/**
 * @swagger
 * /api/agent/topics:
 *   get:
 *     summary: Get suggested discussion topics from stored collection
 *     tags: [Agent]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 3
 *         description: Number of topics to return
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
 *                   description: Whether fallback topics were used due to empty collection
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
