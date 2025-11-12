import { Router } from 'express';
import {
	addFriend,
	respondToFriendRequest,
	getFriends,
	getReceivedRequests,
	getSentRequests,
	deleteFriend,
	cancelRequest,
	getSuggestions,
} from '../controllers/friend.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/friends:
 *   post:
 *     summary: Send a friend request
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toUserId
 *             properties:
 *               toUserId:
 *                 type: string
 *                 description: ID of the user to send friend request to
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/FriendRequest'
 *                 message:
 *                   type: string
 *                 traceId:
 *                   type: string
 *       400:
 *         description: Bad request (already friends, request exists, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', verifyAuth, addFriend);

/**
 * @swagger
 * /api/friends/{requestId}:
 *   put:
 *     summary: Accept or reject a friend request
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *                 description: Action to take on the friend request
 *     responses:
 *       200:
 *         description: Friend request processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/FriendRequest'
 *                 message:
 *                   type: string
 *                 traceId:
 *                   type: string
 *       403:
 *         description: Forbidden (not the recipient)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Friend request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:requestId', verifyAuth, respondToFriendRequest);

/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: Get friend list
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of friends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       friendshipId:
 *                         type: string
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       friendsSince:
 *                         type: string
 *                         format: date-time
 *                 traceId:
 *                   type: string
 */
router.get('/', verifyAuth, getFriends);

/**
 * @swagger
 * /api/friends/requests:
 *   get:
 *     summary: Get pending friend requests (received)
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendRequest'
 *                 traceId:
 *                   type: string
 */
router.get('/requests', verifyAuth, getReceivedRequests);

/**
 * @swagger
 * /api/friends/sent:
 *   get:
 *     summary: Get sent friend requests
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendRequest'
 *                 traceId:
 *                   type: string
 */
router.get('/sent', verifyAuth, getSentRequests);

/**
 * @swagger
 * /api/friends/suggestions:
 *   get:
 *     summary: Get friend suggestions based on mutual friends
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of suggestions to return
 *     responses:
 *       200:
 *         description: List of friend suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       mutualFriends:
 *                         type: number
 *                       reason:
 *                         type: string
 *                 traceId:
 *                   type: string
 */
router.get('/suggestions', verifyAuth, getSuggestions);

/**
 * @swagger
 * /api/friends/{friendId}:
 *   delete:
 *     summary: Remove a friend
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend's user ID
 *     responses:
 *       204:
 *         description: Friend removed successfully
 *       404:
 *         description: Friendship not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:friendId', verifyAuth, deleteFriend);

/**
 * @swagger
 * /api/friends/requests/{requestId}:
 *   delete:
 *     summary: Cancel a sent friend request
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend request ID
 *     responses:
 *       204:
 *         description: Friend request cancelled successfully
 *       403:
 *         description: Forbidden (not the sender)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Friend request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/requests/:requestId', verifyAuth, cancelRequest);

export default router;
