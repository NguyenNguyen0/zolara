import { Request, Response } from 'express';
import { db } from '../configs/firebase.config';
import {
    User,
    FriendList,
    MinimalUser,
    BlockUserList,
    Invitation,
    SendInvitationRequestSchema,
    RespondInvitationRequestSchema,
} from '@repo/types';

const USERS_COLLECTION = 'users';
const FRIEND_LISTS_COLLECTION = 'friendLists';
const BLOCK_USER_LIST_COLLECTION = 'blockLists';
const INVITATION_COLLECTION = 'invitations';

export const getFriendInvitations = async (
    req: Request & { user?: any },
    res: Response,
) => {
    try {
        // Get user ID from token
        const userId = req.user.uid;

        // Find all invitations where this user is the receiver and status is pending
        const invitationsSnapshot = await db
            .collection(INVITATION_COLLECTION)
            .where('receiverId', '==', userId)
            .where('status', '==', 'pending')
            .get();

        if (invitationsSnapshot.empty) {
            return res.status(200).json({
                success: true,
                message: 'No pending invitations found',
                data: [],
            });
        }

        // Format invitations data
        const invitations = invitationsSnapshot.docs.map((doc) => {
            const invitation = doc.data() as Invitation;
            // Safely handle the timestamp conversion
            let timestamp = invitation.timestamp;
            // Check if timestamp has a toDate function (Firestore Timestamp)
            if (timestamp && typeof (timestamp as any).toDate === 'function') {
                timestamp = (timestamp as any).toDate();
            }
            return {
                ...invitation,
                id: doc.id, // Use Firestore document ID
                timestamp, // Use converted timestamp
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Invitations retrieved successfully',
            data: invitations,
        });
    } catch (error) {
        console.error('Error getting friend invitations:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve invitations',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const sendFriendInvitation = async (
    req: Request & { user?: any },
    res: Response,
) => {
    try {
        // Get user ID from token
        const senderId = req.user.uid;

        // Validate request body
        try {
            await SendInvitationRequestSchema.parseAsync(req.body);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data',
                error: error,
            });
        }

        const { receiverId, content, type, groupId } = req.body;

        // Check if receiver exists
        const receiverDoc = await db
            .collection(USERS_COLLECTION)
            .doc(receiverId)
            .get();

        if (!receiverDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found',
                error: 'User does not exist',
            });
        }

        // Check if sender is trying to send invitation to themselves
        if (senderId === receiverId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send invitation to yourself',
                error: 'Invalid receiver',
            });
        }

        // Check if there's already a pending invitation
        const existingInvitationSnapshot = await db
            .collection(INVITATION_COLLECTION)
            .where('senderId', '==', senderId)
            .where('receiverId', '==', receiverId)
            .where('status', '==', 'pending')
            .limit(1)
            .get();

        if (!existingInvitationSnapshot.empty) {
            return res.status(400).json({
                success: false,
                message: 'Invitation already sent',
                error: 'There is already a pending invitation',
            });
        }

        // Check if users are already friends
        const friendListSnapshot = await db
            .collection(FRIEND_LISTS_COLLECTION)
            .where('ownerId', '==', senderId)
            .limit(1)
            .get();

        if (!friendListSnapshot.empty) {
            const friendList = friendListSnapshot.docs[0].data() as FriendList;
            const isAlreadyFriend = friendList.friends.some(
                (friend) => friend.id === receiverId,
            );

            if (isAlreadyFriend) {
                return res.status(400).json({
                    success: false,
                    message: 'Users are already friends',
                    error: 'Cannot send invitation to existing friend',
                });
            }
        }

        // Check if receiver has blocked sender
        const blockListSnapshot = await db
            .collection(BLOCK_USER_LIST_COLLECTION)
            .where('ownerId', '==', receiverId)
            .limit(1)
            .get();

        if (!blockListSnapshot.empty) {
            const blockList = blockListSnapshot.docs[0].data() as BlockUserList;
            const isBlocked = blockList.blockedUsers.some(
                (blocked) => blocked.userId === senderId,
            );

            if (isBlocked) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot send invitation',
                    error: 'You are blocked by this user',
                });
            }
        }

        // Create new invitation
        const newInvitationRef = db.collection(INVITATION_COLLECTION).doc();
        const newInvitation: Invitation = {
            id: newInvitationRef.id,
            timestamp: new Date(),
            senderId,
            receiverId,
            content: content || 'Would you like to be friends?',
            status: 'pending',
            type: type || 'friend',
            ...(groupId && { groupId }),
        };

        await newInvitationRef.set(newInvitation);

        return res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: newInvitation,
        });
    } catch (error) {
        console.error('Error sending friend invitation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send invitation',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const acceptFriendInvitation = async (
    req: Request & { user?: any },
    res: Response,
) => {
    try {
        // Get user ID from token
        const userId = req.user.uid;

        // Get invitation ID from URL parameter
        const invitationId = req.params.invitationId;

        if (!invitationId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data',
                error: 'Invitation ID is required',
            });
        }

        // Get the invitation
        const invitationDoc = await db
            .collection(INVITATION_COLLECTION)
            .doc(invitationId)
            .get();

        if (!invitationDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found',
                error: 'The invitation does not exist',
            });
        }

        const invitation = invitationDoc.data() as Invitation;

        // Check if this user is the intended receiver
        if (invitation.receiverId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
                error: 'You are not the recipient of this invitation',
            });
        }

        // Check if invitation is still pending
        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Invitation already processed',
                error: `Invitation has already been ${invitation.status}`,
            });
        }

        // Update invitation status
        await db.collection(INVITATION_COLLECTION).doc(invitationId).update({
            status: 'accepted',
        });

        // Add each user to the other's friend list
        const senderId = invitation.senderId;

        // Get sender profile
        const senderDoc = await db
            .collection(USERS_COLLECTION)
            .doc(senderId)
            .get();
        if (!senderDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Sender not found',
                error: 'The sender user does not exist anymore',
            });
        }
        const senderData = senderDoc.data() as User;

        // Get receiver profile
        const receiverDoc = await db
            .collection(USERS_COLLECTION)
            .doc(userId)
            .get();
        if (!receiverDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found',
                error: 'Your user profile does not exist',
            });
        }
        const receiverData = receiverDoc.data() as User;

        // Create minimal user objects for friends lists
        const minimalSender: MinimalUser = {
            id: senderId,
            firstName: senderData.firstName,
            lastName: senderData.lastName,
            avatar: senderData.avatar,
            isOnline: senderData.isOnline,
            lastSeen: senderData.lastSeen,
        };

        const minimalReceiver: MinimalUser = {
            id: userId,
            firstName: receiverData.firstName,
            lastName: receiverData.lastName,
            avatar: receiverData.avatar,
            isOnline: receiverData.isOnline,
            lastSeen: receiverData.lastSeen,
        };

        // Add sender to receiver's friend list
        const receiverFriendListSnapshot = await db
            .collection(FRIEND_LISTS_COLLECTION)
            .where('ownerId', '==', userId)
            .limit(1)
            .get();

        if (receiverFriendListSnapshot.empty) {
            // Create new friend list for receiver
            const newFriendListId = db
                .collection(FRIEND_LISTS_COLLECTION)
                .doc().id;
            const newFriendList: FriendList = {
                id: newFriendListId,
                ownerId: userId,
                count: 1,
                friends: [minimalSender],
            };

            await db
                .collection(FRIEND_LISTS_COLLECTION)
                .doc(newFriendListId)
                .set(newFriendList);
        } else {
            // Update existing friend list
            const receiverFriendListId = receiverFriendListSnapshot.docs[0].id;
            const receiverFriendList =
                receiverFriendListSnapshot.docs[0].data() as FriendList;

            // Check if already friends (shouldn't happen, but just in case)
            const isAlreadyFriend = receiverFriendList.friends.some(
                (friend) => friend.id === senderId,
            );

            if (!isAlreadyFriend) {
                receiverFriendList.friends.push(minimalSender);
                receiverFriendList.count = receiverFriendList.friends.length;

                await db
                    .collection(FRIEND_LISTS_COLLECTION)
                    .doc(receiverFriendListId)
                    .update({
                        friends: receiverFriendList.friends,
                        count: receiverFriendList.count,
                    });
            }
        }

        // Add receiver to sender's friend list
        const senderFriendListSnapshot = await db
            .collection(FRIEND_LISTS_COLLECTION)
            .where('ownerId', '==', senderId)
            .limit(1)
            .get();

        if (senderFriendListSnapshot.empty) {
            // Create new friend list for sender
            const newFriendListId = db
                .collection(FRIEND_LISTS_COLLECTION)
                .doc().id;
            const newFriendList: FriendList = {
                id: newFriendListId,
                ownerId: senderId,
                count: 1,
                friends: [minimalReceiver],
            };

            await db
                .collection(FRIEND_LISTS_COLLECTION)
                .doc(newFriendListId)
                .set(newFriendList);
        } else {
            // Update existing friend list
            const senderFriendListId = senderFriendListSnapshot.docs[0].id;
            const senderFriendList =
                senderFriendListSnapshot.docs[0].data() as FriendList;

            // Check if already friends
            const isAlreadyFriend = senderFriendList.friends.some(
                (friend) => friend.id === userId,
            );

            if (!isAlreadyFriend) {
                senderFriendList.friends.push(minimalReceiver);
                senderFriendList.count = senderFriendList.friends.length;

                await db
                    .collection(FRIEND_LISTS_COLLECTION)
                    .doc(senderFriendListId)
                    .update({
                        friends: senderFriendList.friends,
                        count: senderFriendList.count,
                    });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Friend invitation accepted successfully',
        });
    } catch (error) {
        console.error('Error accepting friend invitation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to accept invitation',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const rejectFriendInvitation = async (
    req: Request & { user?: any },
    res: Response,
) => {
    try {
        // Get user ID from token
        const userId = req.user.uid;

        // Get invitation ID from URL parameter
        const invitationId = req.params.invitationId;

        if (!invitationId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data',
                error: 'Invitation ID is required',
            });
        }

        // Get the invitation
        const invitationDoc = await db
            .collection(INVITATION_COLLECTION)
            .doc(invitationId)
            .get();

        if (!invitationDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found',
                error: 'The invitation does not exist',
            });
        }

        const invitation = invitationDoc.data() as Invitation;

        // Check if this user is the intended receiver
        if (invitation.receiverId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
                error: 'You are not the recipient of this invitation',
            });
        }

        // Check if invitation is still pending
        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Invitation already processed',
                error: `Invitation has already been ${invitation.status}`,
            });
        }

        // Update invitation status
        await db.collection(INVITATION_COLLECTION).doc(invitationId).update({
            status: 'rejected',
        });

        return res.status(200).json({
            success: true,
            message: 'Friend invitation rejected successfully',
        });
    } catch (error) {
        console.error('Error rejecting friend invitation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reject invitation',
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

        // Get friend ID from URL parameter
        const friendId = req.params.userId;

        if (!friendId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data',
                error: 'Friend ID is required',
            });
        }

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

export const deleteFriend = async (
    req: Request & { user?: any },
    res: Response,
) => {
    try {
        // Get user ID from token
        const userId = req.user.uid;

        // Get friend ID from URL parameter
        const friendId = req.params.userId;

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

export const blockUser = async (
    req: Request & { user?: any },
    res: Response,
) => {
    try {
        // Get user ID from token
        const userId = req.user.uid;

        // Get block user ID from URL parameter
        const blockUserId = req.params.userId;

        if (!blockUserId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data',
                error: 'User ID is required',
            });
        }

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

        // Get the user ID to unblock from the URL parameter
        const userIdToUnblock = req.params.userId;

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
