import express from 'express';
import {
    addFriend,
    blockUser,
    deleteFriend,
    getFriendList,
    getBlockList,
    sendFriendInvitation,
    getFriendInvitations,
    acceptFriendInvitation,
    rejectFriendInvitation,
    unBlockUser
} from '../controllers/friend.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const friendRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend management endpoints
 */

// --------------------- INVITATION ROUTES ---------------------
/**
 * @swagger
 * /api/friends/invitations:
 *   get:
 *     summary: Get pending friend invitations
 *     description: Retrieve all pending friend invitations for the authenticated user
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetInvitationsResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
friendRouter.get('/invitations', authMiddleware(), getFriendInvitations);

/**
 * @swagger
 * /api/friends/invitations:
 *   post:
 *     summary: Send a friend invitation
 *     description: Send a friend invitation to another user
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendInvitationRequest'
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendInvitationResponse'
 *       400:
 *         description: Invalid input data or user already friend
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Receiver not found
 *       500:
 *         description: Server error
 */
friendRouter.post('/invitations', authMiddleware(), sendFriendInvitation);

/**
 * @swagger
 * /api/friends/invitations/{invitationId}/accept:
 *   patch:
 *     summary: Accept a friend invitation
 *     description: Accept a pending friend invitation
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the invitation to accept
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespondInvitationResponse'
 *       400:
 *         description: Invalid input data or invitation already processed
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Not authorized to respond to this invitation
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
friendRouter.patch('/invitations/:invitationId/accept', authMiddleware(), acceptFriendInvitation);

/**
 * @swagger
 * /api/friends/invitations/{invitationId}/reject:
 *   patch:
 *     summary: Reject a friend invitation
 *     description: Reject a pending friend invitation
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the invitation to reject
 *     responses:
 *       200:
 *         description: Invitation rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespondInvitationResponse'
 *       400:
 *         description: Invalid input data or invitation already processed
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Not authorized to respond to this invitation
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
friendRouter.patch(
    '/invitations/:invitationId/reject',
    authMiddleware(),
    rejectFriendInvitation,
);

// --------------------- FRIENDS ROUTES ---------------------
/**
 * @swagger
 * /api/friends/{id}:
 *   get:
 *     summary: Get user's friend list
 *     description: Retrieve list of friends for a specific user. Use "me" as ID to get your own friend list (requires authentication).
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID or "me" to get current authenticated user's friends
 *     responses:
 *       200:
 *         description: Friend list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetFriendListResponse'
 *       401:
 *         description: Unauthorized - authentication required when using "me" parameter
 *       404:
 *         description: Friend list not found
 *       500:
 *         description: Server error
 */
friendRouter.get(
    '/:id',
    authMiddleware({ optionalAuth: true }),
    getFriendList,
);

/**
 * @swagger
 * /api/friends/{userId}:
 *   post:
 *     summary: Add a friend
 *     description: Add a user to the friend list
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to add as friend
 *     responses:
 *       200:
 *         description: Friend added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddFriendResponse'
 *       400:
 *         description: Invalid input data or friend already exists
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
friendRouter.post('/:userId', authMiddleware(), addFriend);

/**
 * @swagger
 * /api/friends/{userId}:
 *   delete:
 *     summary: Delete a friend
 *     description: Remove a user from the friend list
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: Friend ID to remove
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteFriendResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Friend list or friend not found
 *       500:
 *         description: Server error
 */
friendRouter.delete('/:userId', authMiddleware(), deleteFriend);

// --------------------- BLOCK LIST ROUTES ---------------------
/**
 * @swagger
 * /api/friends/{id}/blocks:
 *   get:
 *     summary: Get user's block list
 *     description: Retrieve list of blocked users for a specific user. Use "me" as ID to get your own block list (requires authentication).
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID or "me" to get current authenticated user's block list
 *     responses:
 *       200:
 *         description: Block list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetBlockListResponse'
 *       401:
 *         description: Unauthorized - authentication required when using "me" parameter
 *       404:
 *         description: Block list not found
 *       500:
 *         description: Server error
 */
friendRouter.get(
    '/:id/blocks',
    authMiddleware({ optionalAuth: true }),
    getBlockList,
);

/**
 * @swagger
 * /api/friends/blocks/{userId}:
 *   post:
 *     summary: Block a user
 *     description: Block a user to prevent them from interacting with you
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to block
 *     responses:
 *       200:
 *         description: User blocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlockUserResponse'
 *       400:
 *         description: Invalid input data or user already blocked
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
friendRouter.post('/blocks/:userId', authMiddleware(), blockUser);

/**
 * @swagger
 * /api/friends/blocks/{userId}:
 *   delete:
 *     summary: Unblock a user
 *     description: Remove a user from your block list
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to unblock
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Human-readable message about the operation
 *                 error:
 *                   type: string
 *                   description: Error message if any
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found in block list
 *       500:
 *         description: Server error
 */
friendRouter.delete('/blocks/:userId', authMiddleware(), unBlockUser);
