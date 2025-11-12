import { db } from '../configs/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import {
	FriendRequest,
	FriendRequestCreateData,
	Friendship,
	FriendSuggestion,
} from '../types/friend';
import { ErrorCode, ErrorMessage, createServiceError } from '../constants/errors';
import { getUserDocument } from './user.service';

/**
 * Convert Firestore data to FriendRequest
 */
const convertFirestoreToFriendRequest = (id: string, data: any): FriendRequest => {
	return {
		id,
		from: data.from,
		to: data.to,
		message: data.message,
		createdAt: data.createdAt?.toDate() || new Date(),
		updatedAt: data.updatedAt?.toDate(),
	};
};

/**
 * Convert Firestore data to Friendship
 */
const convertFirestoreToFriendship = (id: string, data: any): Friendship => {
	return {
		id,
		userA: data.userA,
		userB: data.userB,
		createdAt: data.createdAt?.toDate() || new Date(),
	};
};

/**
 * Normalize user IDs for friendship (userA < userB alphabetically)
 */
const normalizeUserIds = (userId1: string, userId2: string): { userA: string; userB: string } => {
	return userId1 < userId2
		? { userA: userId1, userB: userId2 }
		: { userA: userId2, userB: userId1 };
};

/**
 * Check if friendship exists between two users
 */
const checkFriendshipExists = async (
	userId: string,
	friendId: string,
): Promise<boolean> => {
	const { userA, userB } = normalizeUserIds(userId, friendId);
	
	const friendshipSnapshot = await db
		.collection('friendships')
		.where('userA', '==', userA)
		.where('userB', '==', userB)
		.limit(1)
		.get();

	return !friendshipSnapshot.empty;
};

/**
 * Check if friend request exists
 */
const checkFriendRequestExists = async (
	fromUserId: string,
	toUserId: string,
): Promise<FriendRequest | null> => {
	const requestSnapshot = await db
		.collection('friend_requests')
		.where('from', '==', fromUserId)
		.where('to', '==', toUserId)
		.limit(1)
		.get();

	if (requestSnapshot.empty) {
		return null;
	}

	const doc = requestSnapshot.docs[0];
	return convertFirestoreToFriendRequest(doc.id, doc.data());
};

/**
 * Send friend request
 */
export const sendFriendRequest = async (
	data: FriendRequestCreateData,
): Promise<FriendRequest> => {
	const { from, to, message } = data;

	// Cannot send request to yourself
	if (from === to) {
		throw createServiceError(
			'Cannot send friend request to yourself',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Validate message length
	if (message && message.length > 300) {
		throw createServiceError(
			'Message cannot exceed 300 characters',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Verify both users exist
	const fromUser = await getUserDocument(from);
	const toUser = await getUserDocument(to);

	if (!fromUser || !toUser) {
		throw createServiceError(ErrorMessage.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND);
	}

	// Check if already friends
	const alreadyFriends = await checkFriendshipExists(from, to);
	if (alreadyFriends) {
		throw createServiceError(
			'You are already friends with this user',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Check if request already exists
	const existingRequest = await checkFriendRequestExists(from, to);
	if (existingRequest) {
		throw createServiceError(
			'Friend request already sent',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Check if there's a reverse request (from toUser to fromUser)
	const reverseRequest = await checkFriendRequestExists(to, from);
	if (reverseRequest) {
		throw createServiceError(
			'This user has already sent you a friend request. Please accept their request instead.',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Create friend request
	const now = new Date();
	const requestData: any = {
		from,
		to,
		createdAt: Timestamp.fromDate(now),
	};

	// Only add message if it exists
	if (message) {
		requestData.message = message;
	}

	const requestRef = await db.collection('friend_requests').add(requestData);

	return convertFirestoreToFriendRequest(requestRef.id, requestData);
};

/**
 * Accept friend request
 */
export const acceptFriendRequest = async (
	requestId: string,
	currentUserId: string,
): Promise<FriendRequest> => {
	const requestDoc = await db.collection('friend_requests').doc(requestId).get();

	if (!requestDoc.exists) {
		throw createServiceError('Friend request not found', ErrorCode.NOT_FOUND);
	}

	const requestData = requestDoc.data();
	const request = convertFirestoreToFriendRequest(requestId, requestData);

	// Verify user is the recipient
	if (request.to !== currentUserId) {
		throw createServiceError(
			'You can only accept requests sent to you',
			ErrorCode.FORBIDDEN,
		);
	}

	const now = new Date();
	const batch = db.batch();

	// Delete the friend request (accepted requests are removed)
	const requestRef = db.collection('friend_requests').doc(requestId);
	batch.delete(requestRef);

	// Create friendship with normalized user IDs
	const { userA, userB } = normalizeUserIds(request.from, request.to);
	const friendshipRef = db.collection('friendships').doc();
	batch.set(friendshipRef, {
		userA,
		userB,
		createdAt: Timestamp.fromDate(now),
	});

	await batch.commit();

	return {
		...request,
		updatedAt: now,
	};
};

/**
 * Reject friend request
 */
export const rejectFriendRequest = async (
	requestId: string,
	currentUserId: string,
): Promise<FriendRequest> => {
	const requestDoc = await db.collection('friend_requests').doc(requestId).get();

	if (!requestDoc.exists) {
		throw createServiceError('Friend request not found', ErrorCode.NOT_FOUND);
	}

	const requestData = requestDoc.data();
	const request = convertFirestoreToFriendRequest(requestId, requestData);

	// Verify user is the recipient
	if (request.to !== currentUserId) {
		throw createServiceError(
			'You can only reject requests sent to you',
			ErrorCode.FORBIDDEN,
		);
	}

	// Delete the request (rejected requests are removed)
	await db.collection('friend_requests').doc(requestId).delete();

	return {
		...request,
		updatedAt: new Date(),
	};
};

/**
 * Get friend list
 */
export const getFriendList = async (userId: string): Promise<any[]> => {
	// Get friendships where user is userA
	const friendshipsA = await db
		.collection('friendships')
		.where('userA', '==', userId)
		.get();

	// Get friendships where user is userB
	const friendshipsB = await db
		.collection('friendships')
		.where('userB', '==', userId)
		.get();

	const friends = await Promise.all([
		...friendshipsA.docs.map(async (doc) => {
			const friendship = convertFirestoreToFriendship(doc.id, doc.data());
			const friendUser = await getUserDocument(friendship.userB);

			return {
				friendshipId: friendship.id,
				user: friendUser,
				friendsSince: friendship.createdAt,
			};
		}),
		...friendshipsB.docs.map(async (doc) => {
			const friendship = convertFirestoreToFriendship(doc.id, doc.data());
			const friendUser = await getUserDocument(friendship.userA);

			return {
				friendshipId: friendship.id,
				user: friendUser,
				friendsSince: friendship.createdAt,
			};
		}),
	]);

	// Sort by createdAt in memory
	return friends
		.filter((f) => f.user !== null)
		.sort((a, b) => b.friendsSince.getTime() - a.friendsSince.getTime());
};

/**
 * Get pending friend requests (received)
 */
export const getFriendRequests = async (userId: string): Promise<any[]> => {
	const requestsSnapshot = await db
		.collection('friend_requests')
		.where('to', '==', userId)
		.get();

	const requests = await Promise.all(
		requestsSnapshot.docs.map(async (doc) => {
			const request = convertFirestoreToFriendRequest(doc.id, doc.data());
			const fromUser = await getUserDocument(request.from);

			return {
				...request,
				fromUser,
			};
		}),
	);

	// Sort by createdAt in memory
	return requests
		.filter((r) => r.fromUser !== null)
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

/**
 * Get sent friend requests
 */
export const getSentFriendRequests = async (userId: string): Promise<any[]> => {
	const requestsSnapshot = await db
		.collection('friend_requests')
		.where('from', '==', userId)
		.get();

	const requests = await Promise.all(
		requestsSnapshot.docs.map(async (doc) => {
			const request = convertFirestoreToFriendRequest(doc.id, doc.data());
			const toUser = await getUserDocument(request.to);

			return {
				...request,
				toUser,
			};
		}),
	);

	// Sort by createdAt in memory
	return requests
		.filter((r) => r.toUser !== null)
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

/**
 * Remove friend
 */
export const removeFriend = async (
	userId: string,
	friendId: string,
): Promise<void> => {
	// Verify friendship exists
	const friendshipExists = await checkFriendshipExists(userId, friendId);
	if (!friendshipExists) {
		throw createServiceError('Friendship not found', ErrorCode.NOT_FOUND);
	}

	const { userA, userB } = normalizeUserIds(userId, friendId);

	// Delete friendship
	const friendshipSnapshot = await db
		.collection('friendships')
		.where('userA', '==', userA)
		.where('userB', '==', userB)
		.limit(1)
		.get();

	if (!friendshipSnapshot.empty) {
		await friendshipSnapshot.docs[0].ref.delete();
	}
};

/**
 * Cancel sent friend request
 */
export const cancelFriendRequest = async (
	requestId: string,
	currentUserId: string,
): Promise<void> => {
	const requestDoc = await db.collection('friend_requests').doc(requestId).get();

	if (!requestDoc.exists) {
		throw createServiceError('Friend request not found', ErrorCode.NOT_FOUND);
	}

	const requestData = requestDoc.data();
	const request = convertFirestoreToFriendRequest(requestId, requestData);

	// Verify user is the sender
	if (request.from !== currentUserId) {
		throw createServiceError(
			'You can only cancel requests you sent',
			ErrorCode.FORBIDDEN,
		);
	}

	await db.collection('friend_requests').doc(requestId).delete();
};

/**
 * Get friend suggestions based on mutual friends
 */
export const getFriendSuggestions = async (
	userId: string,
	limit: number = 10,
): Promise<FriendSuggestion[]> => {
	// Get user's current friends
	const friendshipsA = await db
		.collection('friendships')
		.where('userA', '==', userId)
		.get();

	const friendshipsB = await db
		.collection('friendships')
		.where('userB', '==', userId)
		.get();

	const friendIds = [
		...friendshipsA.docs.map((doc) => doc.data().userB),
		...friendshipsB.docs.map((doc) => doc.data().userA),
	];

	if (friendIds.length === 0) {
		// No friends yet, suggest some random users
		const usersSnapshot = await db
			.collection('users')
			.where('isActive', '==', true)
			.where('isLocked', '==', false)
			.limit(limit)
			.get();

		const suggestions: FriendSuggestion[] = [];

		for (const doc of usersSnapshot.docs) {
			if (doc.id !== userId) {
				const user = await getUserDocument(doc.id);
				if (user) {
					suggestions.push({
						user,
						mutualFriends: 0,
						reason: 'New to the platform',
					});
				}
			}
		}

		return suggestions.slice(0, limit);
	}

	// Get pending requests to exclude
	const pendingRequestsSnapshot = await db
		.collection('friend_requests')
		.where('from', '==', userId)
		.get();

	const pendingUserIds = pendingRequestsSnapshot.docs.map(
		(doc) => doc.data().to,
	);

	// Find friends of friends
	const mutualFriendsMap = new Map<string, number>();

	for (const friendId of friendIds) {
		const friendOfFriendA = await db
			.collection('friendships')
			.where('userA', '==', friendId)
			.get();

		const friendOfFriendB = await db
			.collection('friendships')
			.where('userB', '==', friendId)
			.get();

		[...friendOfFriendA.docs, ...friendOfFriendB.docs].forEach((doc) => {
			const data = doc.data();
			const potentialFriendId = data.userA === friendId ? data.userB : data.userA;

			// Skip if it's the user, already a friend, or has pending request
			if (
				potentialFriendId !== userId &&
				!friendIds.includes(potentialFriendId) &&
				!pendingUserIds.includes(potentialFriendId)
			) {
				const count = mutualFriendsMap.get(potentialFriendId) || 0;
				mutualFriendsMap.set(potentialFriendId, count + 1);
			}
		});
	}

	// Sort by mutual friends count and get top suggestions
	const sortedSuggestions = Array.from(mutualFriendsMap.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit);

	const suggestions: FriendSuggestion[] = [];

	for (const [suggestedUserId, mutualCount] of sortedSuggestions) {
		const user = await getUserDocument(suggestedUserId);
		if (user && user.isActive && !user.isLocked) {
			suggestions.push({
				user,
				mutualFriends: mutualCount,
				reason: `${mutualCount} mutual friend${mutualCount > 1 ? 's' : ''}`,
			});
		}
	}

	return suggestions;
};

