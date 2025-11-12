import { db } from '../configs/firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
	Conversation,
	ConversationCreateData,
	ConversationUpdateData,
	ConversationType,
	Participant,
} from '../types/conversation';
import { ErrorCode, createServiceError } from '../constants/errors';
import { getUserDocument } from './user.service';

/**
 * Convert Firestore data to Conversation
 */
const convertFirestoreToConversation = (id: string, data: any): Conversation => {
	const participants: Participant[] = data.participants?.map((p: any) => ({
		userId: p.userId,
		joinedAt: p.joinedAt?.toDate() || new Date(),
	})) || [];

	const unreadCounts = new Map<string, number>();
	if (data.unreadCounts) {
		Object.entries(data.unreadCounts).forEach(([userId, count]) => {
			unreadCounts.set(userId, count as number);
		});
	}

	return {
		id,
		type: data.type,
		participants,
		group: data.group ? {
			name: data.group.name,
			avatarUrl: data.group.avatarUrl,
			createdBy: data.group.createdBy,
		} : undefined,
		lastMessageAt: data.lastMessageAt?.toDate(),
		seenBy: data.seenBy || [],
		lastMessage: data.lastMessage ? {
			id: data.lastMessage.id,
			content: data.lastMessage.content,
			senderId: data.lastMessage.senderId,
			createdAt: data.lastMessage.createdAt?.toDate() || new Date(),
		} : null,
		unreadCounts,
		createdAt: data.createdAt?.toDate() || new Date(),
		updatedAt: data.updatedAt?.toDate(),
	};
};

/**
 * Check if user is participant of conversation
 */
const isParticipant = (conversation: Conversation, userId: string): boolean => {
	return conversation.participants.some((p) => p.userId === userId);
};

/**
 * Create a new conversation (direct or group)
 */
export const createConversation = async (
	data: ConversationCreateData,
): Promise<Conversation> => {
	const { type, participantIds, groupName, groupAvatarUrl, createdBy } = data;

	// Validate participants
	if (!participantIds || participantIds.length < 2) {
		throw createServiceError(
			'At least 2 participants are required',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Validate group conversation
	if (type === ConversationType.GROUP) {
		if (!groupName || groupName.trim().length === 0) {
			throw createServiceError(
				'Group name is required for group conversations',
				ErrorCode.VALIDATION_ERROR,
			);
		}
	}

	// For direct conversations, ensure exactly 2 participants
	if (type === ConversationType.DIRECT && participantIds.length !== 2) {
		throw createServiceError(
			'Direct conversations must have exactly 2 participants',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Check if direct conversation already exists
	if (type === ConversationType.DIRECT) {
		const existingConversation = await findDirectConversation(
			participantIds[0],
			participantIds[1],
		);
		if (existingConversation) {
			return existingConversation;
		}
	}

	// Verify all participants exist
	const users = await Promise.all(
		participantIds.map((id) => getUserDocument(id)),
	);

	if (users.some((user) => !user)) {
		throw createServiceError('One or more users not found', ErrorCode.NOT_FOUND);
	}

	const now = new Date();
	const participants: Participant[] = participantIds.map((userId) => ({
		userId,
		joinedAt: now,
	}));

	const unreadCounts: { [userId: string]: number } = {};
	participantIds.forEach((userId) => {
		unreadCounts[userId] = 0;
	});

	const conversationData: any = {
		type,
		participants: participants.map((p) => ({
			userId: p.userId,
			joinedAt: Timestamp.fromDate(p.joinedAt),
		})),
		seenBy: [],
		lastMessage: null,
		unreadCounts,
		createdAt: Timestamp.fromDate(now),
	};

	if (type === ConversationType.GROUP) {
		conversationData.group = {
			name: groupName,
			avatarUrl: groupAvatarUrl || null,
			createdBy,
		};
	}

	const conversationRef = await db.collection('conversations').add(conversationData);

	return convertFirestoreToConversation(conversationRef.id, conversationData);
};

/**
 * Find direct conversation between two users
 */
export const findDirectConversation = async (
	userId1: string,
	userId2: string,
): Promise<Conversation | null> => {
	const conversationsSnapshot = await db
		.collection('conversations')
		.where('type', '==', ConversationType.DIRECT)
		.get();

	for (const doc of conversationsSnapshot.docs) {
		const data = doc.data();
		const participantIds = data.participants?.map((p: any) => p.userId) || [];

		if (
			participantIds.length === 2 &&
			participantIds.includes(userId1) &&
			participantIds.includes(userId2)
		) {
			return convertFirestoreToConversation(doc.id, data);
		}
	}

	return null;
};

/**
 * Get conversation by ID
 */
export const getConversationById = async (
	conversationId: string,
	userId: string,
): Promise<Conversation> => {
	const conversationDoc = await db
		.collection('conversations')
		.doc(conversationId)
		.get();

	if (!conversationDoc.exists) {
		throw createServiceError('Conversation not found', ErrorCode.NOT_FOUND);
	}

	const conversation = convertFirestoreToConversation(
		conversationDoc.id,
		conversationDoc.data(),
	);

	// Verify user is participant
	if (!isParticipant(conversation, userId)) {
		throw createServiceError(
			'You are not a participant of this conversation',
			ErrorCode.FORBIDDEN,
		);
	}

	return conversation;
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId: string): Promise<any[]> => {
	const conversationsSnapshot = await db.collection('conversations').get();

	const userConversations: Conversation[] = [];

	for (const doc of conversationsSnapshot.docs) {
		const conversation = convertFirestoreToConversation(doc.id, doc.data());

		if (isParticipant(conversation, userId)) {
			userConversations.push(conversation);
		}
	}

	// Sort by lastMessageAt (most recent first)
	userConversations.sort((a, b) => {
		const dateA = a.lastMessageAt?.getTime() || a.createdAt.getTime();
		const dateB = b.lastMessageAt?.getTime() || b.createdAt.getTime();
		return dateB - dateA;
	});

	// Populate participant details
	const conversationsWithDetails = await Promise.all(
		userConversations.map(async (conversation) => {
			const participantDetails = await Promise.all(
				conversation.participants
					.filter((p) => p.userId !== userId)
					.map((p) => getUserDocument(p.userId)),
			);

			return {
				...conversation,
				participantDetails: participantDetails.filter((p) => p !== null),
				unreadCount: conversation.unreadCounts.get(userId) || 0,
			};
		}),
	);

	return conversationsWithDetails;
};

/**
 * Update conversation (group name, avatar)
 */
export const updateConversation = async (
	conversationId: string,
	userId: string,
	data: ConversationUpdateData,
): Promise<Conversation> => {
	const conversation = await getConversationById(conversationId, userId);

	if (conversation.type !== ConversationType.GROUP) {
		throw createServiceError(
			'Only group conversations can be updated',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Verify user is the creator or participant
	if (!isParticipant(conversation, userId)) {
		throw createServiceError(
			'You are not authorized to update this conversation',
			ErrorCode.FORBIDDEN,
		);
	}

	const updateData: any = {
		updatedAt: Timestamp.fromDate(new Date()),
	};

	if (data.groupName !== undefined) {
		updateData['group.name'] = data.groupName;
	}

	if (data.groupAvatarUrl !== undefined) {
		updateData['group.avatarUrl'] = data.groupAvatarUrl;
	}

	await db.collection('conversations').doc(conversationId).update(updateData);

	return getConversationById(conversationId, userId);
};

/**
 * Mark conversation as seen by user
 */
export const markConversationAsSeen = async (
	conversationId: string,
	userId: string,
): Promise<void> => {
	const conversation = await getConversationById(conversationId, userId);

	const updateData: any = {
		seenBy: FieldValue.arrayUnion(userId),
		[`unreadCounts.${userId}`]: 0,
	};

	await db.collection('conversations').doc(conversationId).update(updateData);
};

/**
 * Add participant to group conversation
 */
export const addParticipant = async (
	conversationId: string,
	userId: string,
	newParticipantId: string,
): Promise<Conversation> => {
	const conversation = await getConversationById(conversationId, userId);

	if (conversation.type !== ConversationType.GROUP) {
		throw createServiceError(
			'Can only add participants to group conversations',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Check if user is already a participant
	if (isParticipant(conversation, newParticipantId)) {
		throw createServiceError(
			'User is already a participant',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Verify new participant exists
	const newUser = await getUserDocument(newParticipantId);
	if (!newUser) {
		throw createServiceError('User not found', ErrorCode.NOT_FOUND);
	}

	const now = new Date();
	const newParticipant = {
		userId: newParticipantId,
		joinedAt: Timestamp.fromDate(now),
	};

	await db
		.collection('conversations')
		.doc(conversationId)
		.update({
			participants: FieldValue.arrayUnion(newParticipant),
			[`unreadCounts.${newParticipantId}`]: 0,
			updatedAt: Timestamp.fromDate(now),
		});

	return getConversationById(conversationId, userId);
};

/**
 * Remove participant from group conversation
 */
export const removeParticipant = async (
	conversationId: string,
	userId: string,
	participantIdToRemove: string,
): Promise<Conversation> => {
	const conversation = await getConversationById(conversationId, userId);

	if (conversation.type !== ConversationType.GROUP) {
		throw createServiceError(
			'Can only remove participants from group conversations',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// User can only remove themselves or creator can remove others
	if (
		participantIdToRemove !== userId &&
		conversation.group?.createdBy !== userId
	) {
		throw createServiceError(
			'You are not authorized to remove this participant',
			ErrorCode.FORBIDDEN,
		);
	}

	// Find the participant to remove
	const participantToRemove = conversation.participants.find(
		(p) => p.userId === participantIdToRemove,
	);

	if (!participantToRemove) {
		throw createServiceError('Participant not found', ErrorCode.NOT_FOUND);
	}

	const now = new Date();

	await db
		.collection('conversations')
		.doc(conversationId)
		.update({
			participants: FieldValue.arrayRemove({
				userId: participantToRemove.userId,
				joinedAt: Timestamp.fromDate(participantToRemove.joinedAt),
			}),
			updatedAt: Timestamp.fromDate(now),
		});

	return getConversationById(conversationId, userId);
};

/**
 * Delete conversation
 */
export const deleteConversation = async (
	conversationId: string,
	userId: string,
): Promise<void> => {
	const conversation = await getConversationById(conversationId, userId);

	// Only group creator can delete group conversations
	if (
		conversation.type === ConversationType.GROUP &&
		conversation.group?.createdBy !== userId
	) {
		throw createServiceError(
			'Only the group creator can delete this conversation',
			ErrorCode.FORBIDDEN,
		);
	}

	// Delete all messages in the conversation
	const messagesSnapshot = await db
		.collection('messages')
		.where('conversationId', '==', conversationId)
		.get();

	const batch = db.batch();
	messagesSnapshot.docs.forEach((doc) => {
		batch.delete(doc.ref);
	});

	// Delete the conversation
	batch.delete(db.collection('conversations').doc(conversationId));

	await batch.commit();
};
