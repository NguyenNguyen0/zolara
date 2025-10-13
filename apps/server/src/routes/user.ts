import express from 'express';
import {
	getUserProfile,
	resetPassword,
	updateUserProfile,
	createUserProfile,
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
	uploadImage,
	handleUploadError,
} from '../middlewares/upload.middleware';

export const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         enable:
 *           type: boolean
 *           description: Whether the user is enabled
 *           default: true
 *         isOnline:
 *           type: boolean
 *           description: Whether the user is currently online
 *           default: false
 *         lastSeen:
 *           type: string
 *           format: date-time
 *           description: When the user was last active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user profile was created
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           default: user
 *           description: User's role
 *         dob:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *         gender:
 *           type: string
 *           enum: [male, female, other, prefer_not_to_say]
 *           description: User's gender
 *         bio:
 *           type: string
 *           description: User's biography or about text
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL to user's profile picture
 *
 *     CreateUserProfileRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name
 *           maxLength: 20
 *         lastName:
 *           type: string
 *           description: User's last name
 *           maxLength: 20
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           maxLength: 30
 *
 *     GetUserProfileResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         data:
 *           $ref: '#/components/schemas/User'
 *           description: The user profile data
 *         error:
 *           type: string
 *           description: Error message if any
 *
 *     UpdateUserProfileRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name
 *           maxLength: 20
 *         lastName:
 *           type: string
 *           description: User's last name
 *           maxLength: 20
 *         bio:
 *           type: string
 *           description: User's biography
 *           maxLength: 100
 *         dob:
 *           type: string
 *           format: date
 *           description: User's date of birth (format YYYY-MM-DD)
 *         gender:
 *           type: string
 *           enum: [male, female, other, prefer_not_to_say]
 *           description: User's gender
 *
 *     UpdateUserProfileResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         data:
 *           $ref: '#/components/schemas/User'
 *           description: The updated user data
 *         error:
 *           type: string
 *           description: Error message if any
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: User's current password
 *         newPassword:
 *           type: string
 *           description: User's new password
 *           minLength: 8
 *
 *     MinimalUser:
 *       type: object
 *       required:
 *         - id
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL to user's profile picture
 *         isOnline:
 *           type: boolean
 *           description: Whether the user is currently online
 *         lastSeen:
 *           type: string
 *           format: date-time
 *           description: When the user was last active
 *
 *     FriendList:
 *       type: object
 *       required:
 *         - id
 *         - ownerId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the friend list
 *         ownerId:
 *           type: string
 *           description: ID of the user who owns this friend list
 *         count:
 *           type: integer
 *           description: Number of friends in the list
 *           default: 0
 *         friends:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MinimalUser'
 *           description: Array of friend users
 *
 *     GetFriendListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         data:
 *           $ref: '#/components/schemas/FriendList'
 *           description: The friend list data
 *         error:
 *           type: string
 *           description: Error message if any
 *
 *     AddFriendRequest:
 *       type: object
 *       required:
 *         - friendId
 *       properties:
 *         friendId:
 *           type: string
 *           description: ID of the user to add as friend
 *
 *     AddFriendResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         data:
 *           $ref: '#/components/schemas/MinimalUser'
 *           description: The friend that was added
 *         error:
 *           type: string
 *           description: Error message if any
 *
 *     BlockUserRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user to block
 *
 *     BlockUserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         error:
 *           type: string
 *           description: Error message if any
 *
 *     BlockUserList:
 *       type: object
 *       required:
 *         - id
 *         - ownerId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the block list
 *         ownerId:
 *           type: string
 *           description: ID of the user who owns this block list
 *         count:
 *           type: integer
 *           description: Number of users in the block list
 *           default: 0
 *         blockedUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the blocked user
 *               blockedAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the user was blocked
 *           description: Array of blocked users
 *
 *     GetBlockListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         data:
 *           $ref: '#/components/schemas/BlockUserList'
 *           description: The block list data
 *         error:
 *           type: string
 *           description: Error message if any
 *
 *     DeleteFriendResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         error:
 *           type: string
 *           description: Error message if any
 *
 *     Invitation:
 *       type: object
 *       required:
 *         - id
 *         - senderId
 *         - receiverId
 *         - status
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the invitation
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the invitation was sent
 *         senderId:
 *           type: string
 *           description: ID of the user who sent the invitation
 *         receiverId:
 *           type: string
 *           description: ID of the user who received the invitation
 *         content:
 *           type: string
 *           description: Optional message with the invitation
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           description: Current status of the invitation
 *         type:
 *           type: string
 *           enum: [friend, group]
 *           description: Type of invitation
 *         groupId:
 *           type: string
 *           description: ID of the group if this is a group invitation
 *
 *     SendInvitationRequest:
 *       type: object
 *       required:
 *         - receiverId
 *       properties:
 *         receiverId:
 *           type: string
 *           description: ID of the user to send the invitation to
 *         content:
 *           type: string
 *           description: Optional message to include with the invitation
 *           maxLength: 200
 *         type:
 *           type: string
 *           enum: [friend, group]
 *           default: friend
 *           description: Type of invitation
 *         groupId:
 *           type: string
 *           description: ID of the group if this is a group invitation
 *
 *     SendInvitationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         data:
 *           $ref: '#/components/schemas/Invitation'
 *           description: The created invitation
 *         error:
 *           type: string
 *           description: Error message if any
 *
 *     GetInvitationsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Invitation'
 *           description: List of invitations
 *         error:
 *           type: string
 *           description: Error message if any
 *
 *     RespondInvitationRequest:
 *       type: object
 *       required:
 *         - invitationId
 *         - status
 *       properties:
 *         invitationId:
 *           type: string
 *           description: ID of the invitation to respond to
 *         status:
 *           type: string
 *           enum: [accepted, rejected]
 *           description: The response to the invitation
 *
 *     RespondInvitationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         message:
 *           type: string
 *           description: Human-readable message about the operation
 *         error:
 *           type: string
 *           description: Error message if any
 */

// No friend-related routes are defined here anymore.
// All friend-related endpoints have been moved to the friend router in routes/friend.ts

// --------------------- PASSWORD RESET ROUTE ---------------------
/**
 * @swagger
 * /api/users/reset-password/:
 *   post:
 *     summary: Reset user password
 *     description: Change user password
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResetPasswordResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - current password is incorrect or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
userRouter.post('/reset-password', authMiddleware(), resetPassword);

// --------------------- USER PROFILE ROUTES ---------------------
/**
 * @swagger
 * /api/users/:
 *   post:
 *     summary: Create user profile
 *     description: Create a new user profile with required information
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserProfileRequest'
 *     responses:
 *       201:
 *         description: User profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateUserProfileResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
userRouter.post('/', authMiddleware(), createUserProfile);

/**
 * @swagger
 * /api/users/:
 *   put:
 *     summary: Update user profile
 *     description: Update user profile information and optionally upload a profile picture
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileRequest'
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUserProfileResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
userRouter.put(
	'/',
	authMiddleware(),
	uploadImage,
	handleUploadError,
	updateUserProfile,
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile information
 *     description: Retrieve user profile by user ID.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to get current authenticated user's profile
 *     responses:
 *       200:
 *         description: User profile information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUserProfileResponse'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
userRouter.get('/:id', authMiddleware({ optionalAuth: true }), getUserProfile);
