import { Request, Response } from 'express';
import { db, bucket } from '../configs/firebase.config';
import {
	User,
	UpdateUserProfileRequestSchema,
	ResetPasswordRequestSchema,
	CreateUserProfileRequestSchema,
} from '@repo/types';

const USERS_COLLECTION = 'users';
const FRIEND_LISTS_COLLECTION = 'friendLists';

export const getUserProfile = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		// Handle the case where 'me' is requested but user is not authenticated
		if (req.params.id === 'me' && !req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
				error: 'You must be logged in to access your own profile',
			});
		}

		// Use ID from token if the "me" parameter is provided, otherwise use the ID from the URL
		const userId =
			req.params.id === 'me' && req.user ? req.user.uid : req.params.id;

		const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();

		if (!userDoc.exists) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
				error: 'User with this ID does not exist',
			});
		}

		const userData = userDoc.data() as User;

		return res.status(200).json({
			success: true,
			message: 'User profile retrieved successfully',
			data: userData,
		});
	} catch (error) {
		console.error('Error getting user profile:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve user profile',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const createUserProfile = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		// Validate request body
		try {
			CreateUserProfileRequestSchema.parse(req.body);
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: 'Invalid input data',
				error,
			});
		}

		const { firstName, lastName, email } = req.body;

		// Get user ID from token
		const newUserId = req.user.uid;

		// Check if user profile already exists for this ID
		const existingUser = await db
			.collection(USERS_COLLECTION)
			.doc(newUserId)
			.get();

		if (existingUser.exists) {
			return res.status(400).json({
				success: false,
				message: 'User profile already exists',
				error: 'A profile is already registered for this user',
			});
		}

		// Check if email is already used by another user
		const existingEmailUsers = await db
			.collection(USERS_COLLECTION)
			.where('email', '==', email)
			.limit(1)
			.get();

		if (!existingEmailUsers.empty) {
			return res.status(400).json({
				success: false,
				message: 'User with this email already exists',
				error: 'Email is already registered',
			});
		}

		const newUser: User = {
			id: newUserId,
			email,
			firstName,
			lastName,
			enable: true,
			isOnline: false,
			lastSeen: new Date(),
			createdAt: new Date(),
			role: 'user',
		};

		await db.collection(USERS_COLLECTION).doc(newUserId).set(newUser);

		// Create empty friend list for the user
		const friendListId = db.collection(FRIEND_LISTS_COLLECTION).doc().id;
		const newFriendList = {
			id: friendListId,
			ownerId: newUserId,
			count: 0,
			friends: [],
		};

		await db
			.collection(FRIEND_LISTS_COLLECTION)
			.doc(friendListId)
			.set(newFriendList);

		return res.status(201).json({
			success: true,
			message: 'User profile created successfully',
			data: newUser,
		});
	} catch (error) {
		console.error('Error creating user profile:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to create user profile',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const updateUserProfile = async (
	req: Request & { file?: Express.Multer.File; user?: any },
	res: Response,
) => {
	try {
		// Get user ID from token
		const userId = req.user.uid;

		const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();

		if (!userDoc.exists) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
				error: 'User with this ID does not exist',
			});
		}

		// Validate request body
		try {
			UpdateUserProfileRequestSchema.parse(req.body);
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: 'Invalid input data',
				error,
			});
		}

		const updateData: Record<string, any> = {};

		// Update text fields if provided
		if (req.body.firstName) updateData.firstName = req.body.firstName;
		if (req.body.lastName) updateData.lastName = req.body.lastName;
		if (req.body.bio !== undefined) updateData.bio = req.body.bio;
		if (req.body.gender) updateData.gender = req.body.gender;
		if (req.body.dob) updateData.dob = req.body.dob; // Zod schema will have already converted this to a Date

		// Handle file upload if provided
		if (req.file) {
			const util = await import('util');
			const stream = await import('stream');
			const pipeline = util.promisify(stream.pipeline);

			const fileName = `avatars/${userId}_${Date.now()}.${req.file.originalname.split('.').pop()}`;
			const fileUpload = bucket.file(fileName);

			const passthrough = new stream.PassThrough();
			passthrough.end(req.file.buffer);

			await pipeline(
				passthrough,
				fileUpload.createWriteStream({
					metadata: {
						contentType: req.file.mimetype,
					},
				}),
			);

			// Make the file publicly accessible
			await fileUpload.makePublic();

			// Get the public URL
			const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

			// Update avatar URL in user document
			updateData.avatar = publicUrl;

			// Update user document
			await db
				.collection(USERS_COLLECTION)
				.doc(userId)
				.update(updateData);

			// Get updated user data
			const updatedUserDoc = await db
				.collection(USERS_COLLECTION)
				.doc(userId)
				.get();
			const userData = updatedUserDoc.data() as User;

			return res.status(200).json({
				success: true,
				message: 'User profile updated successfully',
				data: userData,
			});
		} else {
			// Update user document without file
			await db
				.collection(USERS_COLLECTION)
				.doc(userId)
				.update(updateData);

			// Get updated user data
			const updatedUserDoc = await db
				.collection(USERS_COLLECTION)
				.doc(userId)
				.get();
			const userData = updatedUserDoc.data() as User;

			return res.status(200).json({
				success: true,
				message: 'User profile updated successfully',
				data: userData,
			});
		}
	} catch (error) {
		console.error('Error updating user profile:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to update user profile',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const resetPassword = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		// Get user ID from token
		const userId = req.user.uid;

		// Validate request body
		try {
			ResetPasswordRequestSchema.parse(req.body);
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: 'Invalid input data',
				error,
			});
		}

		const { currentPassword, newPassword } = req.body;

		// For security reasons, you would typically use Firebase Authentication here
		// This is a placeholder implementation - in a real app, you would validate the
		// current password against Firebase Auth and then update the password

		// Simulate password validation (replace with actual Firebase Auth validation)
		// TODO: Implement actual password validation using Firebase Auth before production.
		// For example, you can use Firebase Admin SDK to verify the user's credentials.
		// This is a placeholder and should NOT be used in production.
		const isCurrentPasswordValid = false;

		if (!isCurrentPasswordValid) {
			return res.status(401).json({
				success: false,
				message: 'Current password is incorrect',
				error: 'Authentication failed',
			});
		}

		// In a real implementation, update password with Firebase Auth
		// await admin.auth().updateUser(userId, { password: newPassword });

		return res.status(200).json({
			success: true,
			message: 'Password reset successfully',
		});
	} catch (error) {
		console.error('Error resetting password:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to reset password',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
