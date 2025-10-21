import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getMessages,
  sendMessage,
  shareMessage,
  recallMessage,
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage
} from '../controllers/message.controller';

export const messageRouter = express.Router();

messageRouter.use(authMiddleware())

/**
 * @swagger
 * /api/messages/{chatId}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get messages from a chat room by id (limit 20 by default)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat room
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of messages to return
 *       - in: query
 *         name: lastMessageId
 *         schema:
 *           type: string
 *         description: ID of the last message (for pagination)
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Messages retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *                     hasMore:
 *                       type: boolean
 *                       description: Whether there are more messages to load
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to access this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
messageRouter.get('/:chatId', getMessages);

/**
 * @swagger
 * /api/messages/{chatId}:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send a message to a chat room (peer or group)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message content (text, URL, etc.)
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file, sticker]
 *                 default: text
 *                 description: Type of message
 *               replyTo:
 *                 type: string
 *                 description: ID of the message being replied to
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User IDs mentioned in the message
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to send messages to this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
messageRouter.post('/:chatId', sendMessage);

/**
 * @swagger
 * /api/messages/share/{chatId}:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Share message to another chat room (peer or group)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the source chat room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *               - targetChatId
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: ID of the message to share
 *               targetChatId:
 *                 type: string
 *                 description: ID of the target chat room to share the message to
 *     responses:
 *       201:
 *         description: Message shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message shared successfully
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to send messages to the target chat
 *       404:
 *         description: Message or chat not found
 *       500:
 *         description: Internal server error
 */
messageRouter.post('/share/:chatId', shareMessage);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Recall (delete) a message
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to recall
 *     responses:
 *       200:
 *         description: Message recalled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message recalled successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to recall this message (only sender can recall)
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
messageRouter.put('/:messageId', recallMessage);

/**
 * @swagger
 * /api/messages/reaction/{messageId}:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Add a reaction to a message
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to react to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reaction
 *             properties:
 *               reaction:
 *                 type: object
 *                 required:
 *                   - url
 *                 properties:
 *                   url:
 *                     type: string
 *                     description: URL or emoji for the reaction
 *                   description:
 *                     type: string
 *                     description: Optional description of the reaction
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reaction added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                     reactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MessageReaction'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to react in this chat
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
messageRouter.post('/reaction/:messageId', addReaction);

/**
 * @swagger
 * /api/messages/reaction/{messageId}:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Remove a reaction from a message
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to remove reaction from
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reaction removed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                     reactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MessageReaction'
 *       400:
 *         description: Invalid request or user has not reacted to this message
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to interact with this chat
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
messageRouter.delete('/reaction/:messageId', removeReaction);

/**
 * @swagger
 * /api/messages/pin/{messageId}:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Pin a message in a chat room
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to pin
 *     responses:
 *       200:
 *         description: Message pinned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message pinned successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     pinnedContent:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: IDs of all pinned messages in the chat
 *       400:
 *         description: Invalid request or message already pinned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to pin messages in this chat
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
messageRouter.put('/pin/:messageId', pinMessage);

/**
 * @swagger
 * /api/messages/unpin/{messageId}:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Unpin a message from a chat room
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to unpin
 *     responses:
 *       200:
 *         description: Message unpinned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message unpinned successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     pinnedContent:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: IDs of remaining pinned messages in the chat
 *       400:
 *         description: Invalid request or message not pinned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to unpin messages in this chat
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
messageRouter.put('/unpin/:messageId', unpinMessage);
