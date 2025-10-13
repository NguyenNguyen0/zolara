import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
	addUserToGroupChat,
	createGroupChat,
	createPeerChatRoom,
	getChatConversation,
	grantGroupMemberPermission,
	removeUserFromGroupChat,
	sendRequestJoinChatRoom,
	getChatInfo,
} from '../controllers/chat.controller';

export const chatRouter = express.Router();

chatRouter.use(authMiddleware());

/**
 * @swagger
 * /api/chats:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get user's chat conversations (peer chats and groups)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved chat conversations
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
chatRouter.get('/', getChatConversation);

/**
 * @swagger
 * /api/chats/peer:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Create a peer chat room with another user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: ID of the user to create chat with
 *     responses:
 *       201:
 *         description: Peer chat room created successfully
 *       200:
 *         description: Chat room already exists
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Target user not found
 *       500:
 *         description: Internal server error
 */
chatRouter.post('/peer', createPeerChatRoom);

/**
 * @swagger
 * /api/chats/groups:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Create a new group chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group chat
 *               initialMemberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs of initial group members (excluding creator)
 *               autoMemberApproval:
 *                 type: boolean
 *                 description: Whether to auto-approve join requests
 *     responses:
 *       201:
 *         description: Group chat created successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
chatRouter.post('/groups', createGroupChat);

/**
 * @swagger
 * /api/chats/{type}/{chatId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get detailed info about a chat room (peer or group)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [peer, group]
 *         description: Type of chat (peer or group)
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat room or group
 *     responses:
 *       200:
 *         description: Chat information retrieved successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
chatRouter.get('/:type/:chatId', getChatInfo);

/**
 * @swagger
 * /api/chats/groups/{chatId}/join-requests:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send request to join a group chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group chat
 *     responses:
 *       200:
 *         description: Join request sent successfully or user added to group directly
 *       400:
 *         description: Invalid request or user already a member/has pending request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
chatRouter.post('/groups/:chatId/join-requests', sendRequestJoinChatRoom);

/**
 * @swagger
 * /api/chats/groups/{chatId}/members:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Add users to a group chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs of users to add to the group
 *     responses:
 *       200:
 *         description: Users added to group successfully
 *       400:
 *         description: Invalid request parameters or users already members
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to add members
 *       404:
 *         description: Group or user not found
 *       500:
 *         description: Internal server error
 */
chatRouter.post('/groups/:chatId/members', addUserToGroupChat);

/**
 * @swagger
 * /api/chats/groups/{chatId}/members/{userId}:
 *   delete:
 *     tags:
 *       - Chat
 *     summary: Remove a user from a group chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group chat
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to remove
 *     responses:
 *       200:
 *         description: User removed from group successfully
 *       400:
 *         description: Invalid request parameters or user not a member
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to remove this user
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
chatRouter.delete('/groups/:chatId/members/:userId', removeUserFromGroupChat);

/**
 * @swagger
 * /api/chats/groups/{chatId}/members/{userId}/permissions:
 *   patch:
 *     tags:
 *       - Chat
 *     summary: Change a member's permission in a group chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group chat
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to change permissions for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, subadmin, member]
 *                 description: New role for the user
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to change permissions
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
chatRouter.patch('/groups/:chatId/members/:userId/permissions', grantGroupMemberPermission);
