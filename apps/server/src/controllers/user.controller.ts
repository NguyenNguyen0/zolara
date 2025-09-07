import { Request, Response } from 'express';
import { db, bucket } from '../configs/firebase.config';
import {
	User,
	FriendList,
	MinimalUser,
	BlockUserList,
	UpdateUserProfileRequestSchema,
	ResetPasswordRequestSchema,
	AddFriendRequestSchema,
	BlockUserRequestSchema,
	UnblockUserRequestSchema,
	DeleteFriendRequestSchema,
	CreateUserProfileRequestSchema,
} from '@repo/types';

const USERS_COLLECTION = 'users';
const FRIEND_LISTS_COLLECTION = 'friendLists';
const BLOCK_USER_LIST_COLLECTION = 'blockLists';

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
		const newFriendList: FriendList = {
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

export const getFriendList = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		// Handle the case where 'me' is requested but user is not authenticated
		if (req.params.id === 'me' && !req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
				error: 'You must be logged in to access your own friend list',
			});
		}

		// Use ID from token if the "me" parameter is provided, otherwise use the ID from the URL
		const userId =
			req.params.id === 'me' && req.user ? req.user.uid : req.params.id;

		// Find friend list document
		const friendListDoc = await db
			.collection(FRIEND_LISTS_COLLECTION)
			.where('ownerId', '==', userId)
			.limit(1)
			.get();

		if (friendListDoc.empty) {
			// Create new empty friend list if not found
			const newFriendList: FriendList = {
				id: db.collection(FRIEND_LISTS_COLLECTION).doc().id,
				ownerId: userId,
				count: 0,
				friends: [],
			};

			await db
				.collection(FRIEND_LISTS_COLLECTION)
				.doc(newFriendList.id)
				.set(newFriendList);

			return res.status(200).json({
				success: true,
				message: 'Friend list retrieved successfully',
				data: newFriendList,
			});
		}

		const friendList = friendListDoc.docs[0].data() as FriendList;

		return res.status(200).json({
			success: true,
			message: 'Friend list retrieved successfully',
			data: friendList,
		});
	} catch (error) {
		console.error('Error getting friend list:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve friend list',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const addFriend = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		// Get user ID from token
		const userId = req.user.uid;

		// Validate request body
		try {
			AddFriendRequestSchema.parse(req.body);
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: 'Invalid input data',
				error,
			});
		}

		const { friendId } = req.body;

		// Check if friend exists
		const friendDoc = await db
			.collection(USERS_COLLECTION)
			.doc(friendId)
			.get();

		if (!friendDoc.exists) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
				error: 'The user you are trying to add does not exist',
			});
		}

		// Get friend data
		const friendData = friendDoc.data() as User;

		// Create minimal user object
		const minimalFriend: MinimalUser = {
			id: friendId,
			firstName: friendData.firstName,
			lastName: friendData.lastName,
			avatar: friendData.avatar,
			isOnline: friendData.isOnline,
			lastSeen: friendData.lastSeen,
		};

		// Find friend list document
		const friendListDoc = await db
			.collection(FRIEND_LISTS_COLLECTION)
			.where('ownerId', '==', userId)
			.limit(1)
			.get();

		let friendListId: string;
		let currentFriendList: FriendList;

		if (friendListDoc.empty) {
			// Create new friend list if not found
			friendListId = db.collection(FRIEND_LISTS_COLLECTION).doc().id;
			currentFriendList = {
				id: friendListId,
				ownerId: userId,
				count: 0,
				friends: [],
			};
		} else {
			// Use existing friend list
			friendListId = friendListDoc.docs[0].id;
			currentFriendList = friendListDoc.docs[0].data() as FriendList;

			// Check if friend already exists
			const friendExists = currentFriendList.friends.some(
				(f) => f.id === friendId,
			);

			if (friendExists) {
				return res.status(400).json({
					success: false,
					message: 'Friend already exists in your list',
					error: 'This user is already in your friend list',
				});
			}
		}

		// Add friend to list
		currentFriendList.friends.push(minimalFriend);
		currentFriendList.count = currentFriendList.friends.length;

		// Update or create friend list document
		await db
			.collection(FRIEND_LISTS_COLLECTION)
			.doc(friendListId)
			.set(currentFriendList);

		return res.status(200).json({
			success: true,
			message: 'Friend added successfully',
			data: minimalFriend,
		});
	} catch (error) {
		console.error('Error adding friend:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to add friend',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const blockUser = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		// Get user ID from token
		const userId = req.user.uid;

		// Validate request body
		try {
			BlockUserRequestSchema.parse(req.body);
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: 'Invalid input data',
				error,
			});
		}

		const { userId: blockUserId } = req.body;

		// Check if user exists
		const userToBlock = await db
			.collection(USERS_COLLECTION)
			.doc(blockUserId)
			.get();

		if (!userToBlock.exists) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
				error: 'The user you are trying to block does not exist',
			});
		}

		// Find block list document or create a new one
		const blockListQuery = await db
			.collection(BLOCK_USER_LIST_COLLECTION)
			.where('ownerId', '==', userId)
			.limit(1)
			.get();

		let blockListId: string;
		let blockList: BlockUserList;

		if (blockListQuery.empty) {
			// Create new block list
			blockListId = db.collection(BLOCK_USER_LIST_COLLECTION).doc().id;
			blockList = {
				id: blockListId,
				ownerId: userId,
				count: 0,
				blockedUsers: [],
			};
		} else {
			// Use existing block list
			blockListId = blockListQuery.docs[0].id;
			blockList = blockListQuery.docs[0].data() as BlockUserList;

			// Check if user is already blocked
			const isAlreadyBlocked = blockList.blockedUsers.some(
				(u: { userId: string }) => u.userId === blockUserId,
			);

			if (isAlreadyBlocked) {
				return res.status(400).json({
					success: false,
					message: 'User is already blocked',
					error: 'This user is already in your block list',
				});
			}
		}

		// Add user to block list
		blockList.blockedUsers.push({
			userId: blockUserId,
			blockedAt: new Date(),
		});
		blockList.count = blockList.blockedUsers.length;

		// Update or create block list document
		await db
			.collection(BLOCK_USER_LIST_COLLECTION)
			.doc(blockListId)
			.set(blockList);

		// Also remove this user from friend list if they are a friend
		const friendListQuery = await db
			.collection(FRIEND_LISTS_COLLECTION)
			.where('ownerId', '==', userId)
			.limit(1)
			.get();

		if (!friendListQuery.empty) {
			const friendListId = friendListQuery.docs[0].id;
			const friendList = friendListQuery.docs[0].data() as FriendList;

			const friendIndex = friendList.friends.findIndex(
				(f) => f.id === blockUserId,
			);

			if (friendIndex !== -1) {
				// Remove from friend list
				friendList.friends.splice(friendIndex, 1);
				friendList.count = friendList.friends.length;

				await db
					.collection(FRIEND_LISTS_COLLECTION)
					.doc(friendListId)
					.update({
						friends: friendList.friends,
						count: friendList.count,
					});
			}
		}

		return res.status(200).json({
			success: true,
			message: 'User blocked successfully',
		});
	} catch (error) {
		console.error('Error blocking user:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to block user',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const unBlockUser = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		// Get user ID from token
		const userId = req.user.uid;

		// Get the user ID to unblock from the query parameters
		const userIdToUnblock = req.query.userId as string;

		if (!userIdToUnblock) {
			return res.status(400).json({
				success: false,
				message: 'Invalid input data',
				error: 'User ID is required',
			});
		}

		// Find the block list for the current user
		const blockListQuery = await db
			.collection(BLOCK_USER_LIST_COLLECTION)
			.where('ownerId', '==', userId)
			.limit(1)
			.get();

		// If no block list exists or it's empty, return appropriate response
		if (blockListQuery.empty) {
			return res.status(404).json({
				success: false,
				message: 'Block list not found',
				error: 'You do not have a block list',
			});
		}

		// Get the block list document
		const blockListId = blockListQuery.docs[0].id;
		const blockList = blockListQuery.docs[0].data() as BlockUserList;

		// Find the index of the user to unblock
		const blockedUserIndex = blockList.blockedUsers.findIndex(
			(u: { userId: string }) => u.userId === userIdToUnblock,
		);

		// If user is not in the block list, return appropriate response
		if (blockedUserIndex === -1) {
			return res.status(404).json({
				success: false,
				message: 'User not found in block list',
				error: 'This user is not in your block list',
			});
		}

		// Remove the user from the block list
		blockList.blockedUsers.splice(blockedUserIndex, 1);
		blockList.count = blockList.blockedUsers.length;

		// Update the block list document
		await db
			.collection(BLOCK_USER_LIST_COLLECTION)
			.doc(blockListId)
			.update({
				blockedUsers: blockList.blockedUsers,
				count: blockList.count,
			});

		return res.status(200).json({
			success: true,
			message: 'User unblocked successfully',
		});
	} catch (error) {
		console.error('Error unblocking user:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to unblock user',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const getBlockList = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		// Handle the case where 'me' is requested but user is not authenticated
		if (req.params.id === 'me' && !req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
				error: 'You must be logged in to access your own block list',
			});
		}

		// Use ID from token if the "me" parameter is provided, otherwise use the ID from the URL
		const userId =
			req.params.id === 'me' && req.user ? req.user.uid : req.params.id;

		// Find block list document
		const blockListDoc = await db
			.collection(BLOCK_USER_LIST_COLLECTION)
			.where('ownerId', '==', userId)
			.limit(1)
			.get();

		if (blockListDoc.empty) {
			// Create new empty block list if not found
			const newBlockList: BlockUserList = {
				id: db.collection(BLOCK_USER_LIST_COLLECTION).doc().id,
				ownerId: userId,
				count: 0,
				blockedUsers: [],
			};

			await db
				.collection(BLOCK_USER_LIST_COLLECTION)
				.doc(newBlockList.id)
				.set(newBlockList);

			return res.status(200).json({
				success: true,
				message: 'Block list retrieved successfully',
				data: newBlockList,
			});
		}

		const blockList = blockListDoc.docs[0].data() as BlockUserList;

		return res.status(200).json({
			success: true,
			message: 'Block list retrieved successfully',
			data: blockList,
		});
	} catch (error) {
		console.error('Error getting block list:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve block list',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const deleteFriend = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		// Get user ID from token
		const userId = req.user.uid;

		const friendId = req.query.friendId as string;

		if (!friendId) {
			return res.status(400).json({
				success: false,
				message: 'Invalid input data',
				error: 'Friend ID is required',
			});
		}

		// Find friend list document
		const friendListDoc = await db
			.collection(FRIEND_LISTS_COLLECTION)
			.where('ownerId', '==', userId)
			.limit(1)
			.get();

		if (friendListDoc.empty) {
			return res.status(404).json({
				success: false,
				message: 'Friend list not found',
				error: 'You do not have a friend list',
			});
		}

		const friendListId = friendListDoc.docs[0].id;
		const friendList = friendListDoc.docs[0].data() as FriendList;

		// Check if friend exists in list
		const friendIndex = friendList.friends.findIndex(
			(f) => f.id === friendId,
		);

		if (friendIndex === -1) {
			return res.status(404).json({
				success: false,
				message: 'Friend not found',
				error: 'This user is not in your friend list',
			});
		}

		// Remove friend from list
		friendList.friends.splice(friendIndex, 1);
		friendList.count = friendList.friends.length;

		// Update friend list document
		await db.collection(FRIEND_LISTS_COLLECTION).doc(friendListId).update({
			friends: friendList.friends,
			count: friendList.count,
		});

		return res.status(200).json({
			success: true,
			message: 'Friend removed successfully',
		});
	} catch (error) {
		console.error('Error deleting friend:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to delete friend',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
