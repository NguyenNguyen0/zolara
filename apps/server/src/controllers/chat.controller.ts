import { Request, Response } from 'express';
import { db, bucket } from '../configs/firebase.config';
import {
	User,
	Chat,
	Group,
	Invitation,
	MinimalUser,
	Message,
} from '@repo/types';

const USERS_COLLECTION = 'users';
const INVITATION_COLLECTION = 'invitations';
const CHAT_ROOM_COLLECTION = 'chats';
const GROUP_CHAT_ROOM_COLLECTION = 'groups';

interface PeerChatWithParticipant {
	id: string;
	type: 'peer';
	lastUpdate?: Date;
	participantIds: string[];
	participant?: {
		id: string;
		firstName: string;
		lastName: string;
		avatar?: string;
		isOnline: boolean;
		lastSeen?: Date;
	};
}

interface GroupChatSummary {
	id: string;
	type: 'group';
	name: string;
	avatar?: string;
	memberCount: number;
	adminId: string;
	isAdmin: boolean;
	isSubAdmin: boolean;
	lastUpdate?: Date;
}

type ConversationSummary = PeerChatWithParticipant | GroupChatSummary;

export const getChatConversation = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		const userId = req.user.uid;

		// Get all peer chat rooms where user is a participant
		const peerChatsSnapshot = await db
			.collection(CHAT_ROOM_COLLECTION)
			.where('type', '==', 'peer')
			.where('participantIds', 'array-contains', userId)
			.get();

		// Get all group chats where the user is a member
		const groupChatsSnapshot = await db
			.collection(GROUP_CHAT_ROOM_COLLECTION)
			.where('memberIds', 'array-contains', userId)
			.get();

		const conversations: ConversationSummary[] = [];

		// Process peer chats
		if (!peerChatsSnapshot.empty) {
			const peerChats: PeerChatWithParticipant[] = peerChatsSnapshot.docs.map(doc => {
				const chatData = doc.data() as Chat;
				return {
					id: doc.id,
					type: 'peer',
					lastUpdate: chatData.lastUpdate,
					participantIds: chatData.participantIds || [],
				};
			});

			// Fetch details of the other participants in peer chats
			for (const chat of peerChats) {
				// Find the other participant's ID (not the current user)
				const otherUserId = chat.participantIds.find(id => id !== userId);
				if (otherUserId) {
					const otherUserDoc = await db.collection(USERS_COLLECTION).doc(otherUserId).get();
					if (otherUserDoc.exists) {
						const userData = otherUserDoc.data() as User;
						chat.participant = {
							id: userData.id,
							firstName: userData.firstName,
							lastName: userData.lastName,
							avatar: userData.avatar,
							isOnline: userData.isOnline,
							lastSeen: userData.lastSeen
						};
					}
				}
				conversations.push(chat);
			}
		}

		// Process group chats
		if (!groupChatsSnapshot.empty) {
			const groupChats: GroupChatSummary[] = groupChatsSnapshot.docs.map(doc => {
				const groupData = doc.data() as Group;
				return {
					id: doc.id,
					type: 'group',
					name: groupData.name,
					avatar: groupData.avatar,
					memberCount: groupData.memberCount,
					adminId: groupData.adminId,
					isAdmin: groupData.adminId === userId,
					isSubAdmin: groupData.subAdminIds?.includes(userId) || false,
					lastUpdate: groupData.createdAt, // Using createdAt since Group doesn't have lastUpdate
				};
			});
			conversations.push(...groupChats);
		}

		// Sort by last update, newest first
		conversations.sort((a, b) => {
			const dateA = a.lastUpdate ? new Date(a.lastUpdate).getTime() : 0;
			const dateB = b.lastUpdate ? new Date(b.lastUpdate).getTime() : 0;
			return dateB - dateA;
		});

		return res.status(200).json({
			success: true,
			message: 'Chat conversations retrieved successfully',
			data: conversations,
		});
	} catch (error) {
		console.error('Error getting chat conversations:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve chat conversations',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const createPeerChatRoom = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		const userId = req.user.uid;
		const { targetUserId } = req.body;

		if (!targetUserId) {
			return res.status(400).json({
				success: false,
				message: 'Target user ID is required',
			});
		}

		// Check if target user exists
		const targetUserDoc = await db.collection(USERS_COLLECTION).doc(targetUserId).get();
		if (!targetUserDoc.exists) {
			return res.status(404).json({
				success: false,
				message: 'Target user not found',
			});
		}

		// Check if chat room already exists between these users
		const existingChatQuery = await db
			.collection(CHAT_ROOM_COLLECTION)
			.where('type', '==', 'peer')
			.where('participantIds', 'array-contains', userId)
			.get();

		// Look through results to see if there's a chat with both users
		let existingChatId: string | null = null;
		existingChatQuery.forEach(doc => {
			const chatData = doc.data() as Chat;
			if (chatData.participantIds &&
				chatData.participantIds.includes(userId) &&
				chatData.participantIds.includes(targetUserId)) {
				existingChatId = doc.id;
			}
		});

		// If chat already exists, return it
		if (existingChatId) {
			return res.status(200).json({
				success: true,
				message: 'Chat room already exists',
				data: { chatId: existingChatId },
			});
		}

		// Create a new peer chat room
		const newChat: Omit<Chat, 'id'> = {
			type: 'peer',
			lastUpdate: new Date(),
			participantIds: [userId, targetUserId],
			pinnedContent: [],
			messages: [],
		};

		const chatDocRef = await db.collection(CHAT_ROOM_COLLECTION).add(newChat);

		// Get user info for both participants
		const currentUserDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
		const currentUserData = currentUserDoc.data() as User;
		const targetUserData = targetUserDoc.data() as User;

		return res.status(201).json({
			success: true,
			message: 'Peer chat room created successfully',
			data: {
				chatId: chatDocRef.id,
				participants: [
					{
						id: currentUserData.id,
						firstName: currentUserData.firstName,
						lastName: currentUserData.lastName,
						avatar: currentUserData.avatar,
					},
					{
						id: targetUserData.id,
						firstName: targetUserData.firstName,
						lastName: targetUserData.lastName,
						avatar: targetUserData.avatar,
					}
				],
			},
		});
	} catch (error) {
		console.error('Error creating peer chat room:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to create peer chat room',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const sendRequestJoinChatRoom = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		const userId = req.user.uid;
		const { chatId } = req.params;

		if (!chatId) {
			return res.status(400).json({
				success: false,
				message: 'Group ID is required',
			});
		}

		const groupId = chatId; // Using the chatId from params as groupId

		// Check if group exists
		const groupDoc = await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).get();
		if (!groupDoc.exists) {
			return res.status(404).json({
				success: false,
				message: 'Group not found',
			});
		}

		const groupData = groupDoc.data() as Group;

		// Check if user is already a member
		if (groupData.memberIds.includes(userId)) {
			return res.status(400).json({
				success: false,
				message: 'You are already a member of this group',
			});
		}

		// Check if there's already a pending invitation
		const existingInvitation = await db
			.collection(INVITATION_COLLECTION)
			.where('type', '==', 'group')
			.where('targetId', '==', groupId)
			.where('userId', '==', userId)
			.where('status', '==', 'pending')
			.get();

		if (!existingInvitation.empty) {
			return res.status(400).json({
				success: false,
				message: 'You already have a pending request to join this group',
			});
		}

		// Get current user info for the invitation
		const currentUserDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
		if (!currentUserDoc.exists) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}
		const currentUserData = currentUserDoc.data() as User;

		// If group has autoMemberApproval enabled, add user directly
		if (groupData.groupConfig.autoMemberApproval) {
			// Add user to the group directly
			await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).update({
				memberIds: [...groupData.memberIds, userId],
				memberCount: groupData.memberCount + 1
			});

			return res.status(200).json({
				success: true,
				message: 'You have been added to the group successfully',
			});
		}

		// Otherwise create an invitation
		const invitation: Omit<Invitation, 'id'> = {
			type: 'group',
			timestamp: new Date(),
			senderId: userId,
			receiverId: groupData.adminId, // Send to the group admin
			content: `${currentUserData.firstName} ${currentUserData.lastName} would like to join your group.`,
			status: 'pending',
			groupId: groupId,
		};

		await db.collection(INVITATION_COLLECTION).add(invitation);

		return res.status(200).json({
			success: true,
			message: 'Join request sent successfully. Waiting for approval from group admin.',
		});
	} catch (error) {
		console.error('Error sending group join request:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to send group join request',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const createGroupChat = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		const userId = req.user.uid;
		const { name, initialMemberIds, autoMemberApproval } = req.body;

		// Validate required fields
		if (!name) {
			return res.status(400).json({
				success: false,
				message: 'Group name is required',
			});
		}

		// Ensure the group has at least the admin as a member
		let memberIds = [userId];
		let memberCount = 1;

		// Add initial members if provided
		if (initialMemberIds && Array.isArray(initialMemberIds)) {
			// Filter out duplicate IDs and the admin ID (which is already included)
			const uniqueMembers = initialMemberIds.filter(
				id => id !== userId && !memberIds.includes(id)
			);

			// Validate each member ID exists
			for (const memberId of uniqueMembers) {
				const memberDoc = await db.collection(USERS_COLLECTION).doc(memberId).get();
				if (!memberDoc.exists) {
					return res.status(400).json({
						success: false,
						message: `User ${memberId} does not exist`,
					});
				}
			}

			// Add valid member IDs to the list
			memberIds = [...memberIds, ...uniqueMembers];
			memberCount = memberIds.length;
		}

		// Handle avatar upload if provided
		let avatarUrl = undefined;
		if (req.file) {
			const file = req.file;
			const fileName = `groups/${Date.now()}_${file.originalname}`;
			const fileBuffer = file.buffer;

			// Upload to Firebase Storage
			const fileRef = bucket.file(fileName);
			await fileRef.save(fileBuffer, {
				metadata: {
					contentType: file.mimetype,
				},
			});

			// Make the file publicly accessible
			await fileRef.makePublic();

			// Get the public URL
			avatarUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
		}

		// Create the group object
		const newGroup: Omit<Group, 'id'> = {
			name,
			memberIds,
			memberCount,
			adminId: userId,
			createdAt: new Date(),
			groupConfig: {
				autoMemberApproval: autoMemberApproval !== undefined ? autoMemberApproval : true
			},
		};

		// Add avatar if uploaded
		if (avatarUrl) {
			newGroup.avatar = avatarUrl;
		}

		// Create the group in Firestore
		const groupDocRef = await db.collection(GROUP_CHAT_ROOM_COLLECTION).add(newGroup);
		const groupId = groupDocRef.id;

		// Get member details to return in the response
		const members: MinimalUser[] = [];
		for (const memberId of memberIds) {
			const memberDoc = await db.collection(USERS_COLLECTION).doc(memberId).get();
			if (memberDoc.exists) {
				const userData = memberDoc.data() as User;
				members.push({
					id: userData.id,
					firstName: userData.firstName,
					lastName: userData.lastName,
					avatar: userData.avatar,
					isOnline: userData.isOnline,
					lastSeen: userData.lastSeen
				});
			}
		}

		return res.status(201).json({
			success: true,
			message: 'Group created successfully',
			data: {
				id: groupId,
				name: newGroup.name,
				avatar: newGroup.avatar,
				adminId: userId,
				memberCount: memberCount,
				createdAt: newGroup.createdAt,
				members: members,
				groupConfig: newGroup.groupConfig,
			},
		});
	} catch (error) {
		console.error('Error creating group chat:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to create group chat',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const getChatInfo = async (req: Request & { user?: any }, res: Response) => {
	try {
		const userId = req.user.uid;
		const { chatId, type } = req.params;

		if (!chatId || !type) {
			return res.status(400).json({
				success: false,
				message: 'Chat ID and type are required',
			});
		}

		if (type !== 'peer' && type !== 'group') {
			return res.status(400).json({
				success: false,
				message: 'Invalid chat type. Must be "peer" or "group"',
			});
		}

		// Fetch the appropriate chat based on the type
		if (type === 'peer') {
			const chatDoc = await db.collection(CHAT_ROOM_COLLECTION).doc(chatId).get();

			if (!chatDoc.exists) {
				return res.status(404).json({
					success: false,
					message: 'Chat not found',
				});
			}

			const chatData = chatDoc.data() as Chat;

			// Check if the user is a participant in this chat
			if (!chatData.participantIds?.includes(userId)) {
				return res.status(403).json({
					success: false,
					message: 'You are not authorized to view this chat',
				});
			}

			// Get information about the other participant
			const otherUserId = chatData.participantIds.find(id => id !== userId);
			if (!otherUserId) {
				return res.status(500).json({
					success: false,
					message: 'Failed to identify chat participant',
				});
			}

			const otherUserDoc = await db.collection(USERS_COLLECTION).doc(otherUserId).get();
			if (!otherUserDoc.exists) {
				return res.status(404).json({
					success: false,
					message: 'Chat participant not found',
				});
			}

			const userData = otherUserDoc.data() as User;
			const participant: MinimalUser = {
				id: userData.id,
				firstName: userData.firstName,
				lastName: userData.lastName,
				avatar: userData.avatar,
				isOnline: userData.isOnline,
				lastSeen: userData.lastSeen,
			};

			return res.status(200).json({
				success: true,
				message: 'Chat information retrieved successfully',
				data: {
					id: chatId,
					type: 'peer',
					lastUpdate: chatData.lastUpdate,
					participant: participant,
					pinnedContent: chatData.pinnedContent || [],
				},
			});
		} else {
			// It's a group chat
			const groupDoc = await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(chatId).get();

			if (!groupDoc.exists) {
				return res.status(404).json({
					success: false,
					message: 'Group not found',
				});
			}

			const groupData = groupDoc.data() as Group;

			// Check if the user is a member of this group
			if (!groupData.memberIds.includes(userId)) {
				return res.status(403).json({
					success: false,
					message: 'You are not a member of this group',
				});
			}

			// Get information about all members
			const members: MinimalUser[] = [];
			for (const memberId of groupData.memberIds) {
				const memberDoc = await db.collection(USERS_COLLECTION).doc(memberId).get();
				if (memberDoc.exists) {
					const memberData = memberDoc.data() as User;
					members.push({
						id: memberData.id,
						firstName: memberData.firstName,
						lastName: memberData.lastName,
						avatar: memberData.avatar,
						isOnline: memberData.isOnline,
						lastSeen: memberData.lastSeen,
					});
				}
			}

			return res.status(200).json({
				success: true,
				message: 'Group information retrieved successfully',
				data: {
					id: chatId,
					type: 'group',
					name: groupData.name,
					avatar: groupData.avatar,
					createdAt: groupData.createdAt,
					adminId: groupData.adminId,
					subAdminIds: groupData.subAdminIds || [],
					memberCount: groupData.memberCount,
					members: members,
					groupConfig: groupData.groupConfig,
					isAdmin: groupData.adminId === userId,
					isSubAdmin: groupData.subAdminIds?.includes(userId) || false,
				},
			});
		}
	} catch (error) {
		console.error('Error getting chat info:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve chat information',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
export const addUserToGroupChat = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		const userId = req.user.uid;
		const { chatId } = req.params;
		const { userIds } = req.body;

		// Validate required fields
		if (!chatId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Group ID and at least one user ID are required',
			});
		}

		const groupId = chatId; // Using the chatId from params as groupId

		// Get the group
		const groupDoc = await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).get();
		if (!groupDoc.exists) {
			return res.status(404).json({
				success: false,
				message: 'Group not found',
			});
		}

		const groupData = groupDoc.data() as Group;

		// Check if the current user is an admin or sub-admin of the group
		const isAdmin = groupData.adminId === userId;
		const isSubAdmin = groupData.subAdminIds?.includes(userId) || false;

		if (!isAdmin && !isSubAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Only admins and sub-admins can add members to the group',
			});
		}

		// Filter out users who are already members
		const newUserIds = userIds.filter(id => !groupData.memberIds.includes(id));

		// If all users are already members, return early
		if (newUserIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'All specified users are already members of the group',
			});
		}

		// Validate that all users exist
		const newMembers: MinimalUser[] = [];
		for (const newUserId of newUserIds) {
			const userDoc = await db.collection(USERS_COLLECTION).doc(newUserId).get();
			if (!userDoc.exists) {
				return res.status(404).json({
					success: false,
					message: `User ${newUserId} not found`,
				});
			}

			const userData = userDoc.data() as User;
			newMembers.push({
				id: userData.id,
				firstName: userData.firstName,
				lastName: userData.lastName,
				avatar: userData.avatar,
				isOnline: userData.isOnline,
				lastSeen: userData.lastSeen,
			});
		}

		// Update the group with new members
		const updatedMemberIds = [...groupData.memberIds, ...newUserIds];
		const updatedMemberCount = updatedMemberIds.length;

		await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).update({
			memberIds: updatedMemberIds,
			memberCount: updatedMemberCount
		});

		return res.status(200).json({
			success: true,
			message: 'Users added to group successfully',
			data: {
				newMembers,
				memberCount: updatedMemberCount
			},
		});
	} catch (error) {
		console.error('Error adding users to group:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to add users to group',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const removeUserFromGroupChat = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		const currentUserId = req.user.uid;
		const { chatId, userId } = req.params;

		// Validate required fields
		if (!chatId || !userId) {
			return res.status(400).json({
				success: false,
				message: 'Group ID and user ID are required',
			});
		}

		const groupId = chatId; // Using the chatId from params as groupId

		// Get the group
		const groupDoc = await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).get();
		if (!groupDoc.exists) {
			return res.status(404).json({
				success: false,
				message: 'Group not found',
			});
		}

		const groupData = groupDoc.data() as Group;

		// Check permissions for removing users
		const isAdmin = groupData.adminId === currentUserId;
		const isSubAdmin = groupData.subAdminIds?.includes(currentUserId) || false;
		const isSelfRemoval = currentUserId === userId;

		// Users can remove themselves, but only admins/sub-admins can remove others
		if (!isSelfRemoval && !isAdmin && !isSubAdmin) {
			return res.status(403).json({
				success: false,
				message: 'You do not have permission to remove this user',
			});
		}

		// Check if the user to be removed is a member
		if (!groupData.memberIds.includes(userId)) {
			return res.status(400).json({
				success: false,
				message: 'User is not a member of this group',
			});
		}

		// Cannot remove the admin (except if the admin is removing themselves)
		if (userId === groupData.adminId && !isSelfRemoval) {
			return res.status(403).json({
				success: false,
				message: 'The group admin cannot be removed',
			});
		}

		// Handle admin removal (admin is leaving the group)
		if (isSelfRemoval && isAdmin) {
			// If the admin is leaving, promote a sub-admin to admin if any exist
			if (groupData.subAdminIds && groupData.subAdminIds.length > 0) {
				// Promote the first sub-admin to admin
				const newAdminId = groupData.subAdminIds[0];
				const updatedSubAdmins = groupData.subAdminIds.filter(id => id !== newAdminId);

				// Remove admin from members and update admin role
				const updatedMemberIds = groupData.memberIds.filter(id => id !== userId);

				await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).update({
					memberIds: updatedMemberIds,
					memberCount: updatedMemberIds.length,
					adminId: newAdminId,
					subAdminIds: updatedSubAdmins
				});

				return res.status(200).json({
					success: true,
					message: 'You left the group and a new admin was appointed',
				});
			}
			// If no sub-admins exist, promote a regular member to admin if any exist
			else if (groupData.memberIds.length > 1) {
				// Find the next member who's not the current admin
				const newAdminId = groupData.memberIds.find(id => id !== userId);

				if (!newAdminId) {
					return res.status(500).json({
						success: false,
						message: 'Failed to find a new admin for the group',
					});
				}

				// Remove admin from members and update admin role
				const updatedMemberIds = groupData.memberIds.filter(id => id !== userId);

				await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).update({
					memberIds: updatedMemberIds,
					memberCount: updatedMemberIds.length,
					adminId: newAdminId,
				});

				return res.status(200).json({
					success: true,
					message: 'You left the group and a new admin was appointed',
				});
			}
			// If the admin is the only member, delete the group
			else {
				await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).delete();

				return res.status(200).json({
					success: true,
					message: 'You left the group and it was deleted as no members remain',
				});
			}
		}

		// Regular user removal (or self-removal for non-admin)
		// Also update subAdminIds if the removed user is a sub-admin
		let updateData: any = {};

		// Remove from members
		const updatedMemberIds = groupData.memberIds.filter(id => id !== userId);
		updateData.memberIds = updatedMemberIds;
		updateData.memberCount = updatedMemberIds.length;

		// Remove from sub-admins if applicable
		if (groupData.subAdminIds?.includes(userId)) {
			const updatedSubAdmins = groupData.subAdminIds.filter(id => id !== userId);
			updateData.subAdminIds = updatedSubAdmins;
		}

		await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).update(updateData);

		// Customize message based on who's removing whom
		const message = isSelfRemoval
			? 'You left the group successfully'
			: 'User removed from the group successfully';

		return res.status(200).json({
			success: true,
			message,
		});
	} catch (error) {
		console.error('Error removing user from group:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to remove user from group',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

export const grantGroupMemberPermission = async (
	req: Request & { user?: any },
	res: Response,
) => {
	try {
		const currentUserId = req.user.uid;
		const { chatId, userId } = req.params;
		const { role } = req.body;

		// Validate required fields
		if (!chatId || !userId || !role) {
			return res.status(400).json({
				success: false,
				message: 'Group ID, user ID, and role are required',
			});
		}

		const groupId = chatId; // Using the chatId from params as groupId

		// Validate the role
		if (role !== 'admin' && role !== 'subadmin' && role !== 'member') {
			return res.status(400).json({
				success: false,
				message: 'Invalid role. Must be "admin", "subadmin", or "member"',
			});
		}

		// Get the group
		const groupDoc = await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).get();
		if (!groupDoc.exists) {
			return res.status(404).json({
				success: false,
				message: 'Group not found',
			});
		}

		const groupData = groupDoc.data() as Group;

		// Check if the current user is the admin of the group
		if (groupData.adminId !== currentUserId) {
			return res.status(403).json({
				success: false,
				message: 'Only the group admin can change member roles',
			});
		}

		// Check if the target user is a member of the group
		if (!groupData.memberIds.includes(userId)) {
			return res.status(400).json({
				success: false,
				message: 'User is not a member of this group',
			});
		}

		// Prevent changing your own role
		if (userId === currentUserId) {
			return res.status(400).json({
				success: false,
				message: 'You cannot change your own role',
			});
		}

		// Initialize update data
		const updateData: Record<string, any> = {};

		// Handle role assignment based on the role requested
		if (role === 'admin') {
			// Transfer admin role to another user
			// Current admin becomes sub-admin

			// Get existing sub-admin list or initialize
			const subAdminIds = groupData.subAdminIds || [];

			// Remove new admin from sub-admin list if they're already a sub-admin
			const updatedSubAdminIds = [
				...subAdminIds.filter(id => id !== userId),
				currentUserId // Add current admin to sub-admins
			];

			updateData.adminId = userId;
			updateData.subAdminIds = updatedSubAdminIds;
		}
		else if (role === 'subadmin') {
			// Make user a sub-admin

			// Get existing sub-admin list or initialize
			const subAdminIds = groupData.subAdminIds || [];

			// Only add if not already a sub-admin
			if (!subAdminIds.includes(userId)) {
				updateData.subAdminIds = [...subAdminIds, userId];
			} else {
				return res.status(400).json({
					success: false,
					message: 'User is already a sub-admin',
				});
			}
		}
		else if (role === 'member') {
			// Demote from sub-admin to regular member
			const subAdminIds = groupData.subAdminIds || [];

			// Check if user is actually a sub-admin
			if (!subAdminIds.includes(userId)) {
				return res.status(400).json({
					success: false,
					message: 'User is already a regular member',
				});
			}

			// Remove from sub-admin list
			updateData.subAdminIds = subAdminIds.filter(id => id !== userId);
		}

		// Update the group with the new role assignments
		await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(groupId).update(updateData);

		// Get the name of the user whose role changed
		const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
		const userData = userDoc.exists ? userDoc.data() as User : null;
		const userName = userData ? `${userData.firstName} ${userData.lastName}` : 'User';

		// Create appropriate success message based on the role
		let message = '';
		if (role === 'admin') {
			message = `${userName} is now the group admin`;
		} else if (role === 'subadmin') {
			message = `${userName} is now a sub-admin`;
		} else {
			message = `${userName} is now a regular member`;
		}

		return res.status(200).json({
			success: true,
			message,
		});
	} catch (error) {
		console.error('Error granting group permission:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to update group member permission',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
