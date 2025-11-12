import { db } from '../configs/firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
	Message,
	MessageCreateData,
	MessageUpdateData,
	MessagesQueryParams,
} from '../types/message';
import { ErrorCode, createServiceError } from '../constants/errors';
import { getUserDocument } from './user.service';
import { getConversationById } from './conversation.service';

/**
 * Convert Firestore data to Message
 */
const convertFirestoreToMessage = (id: string, data: any): Message => {
	return {
		id,
		conversationId: data.conversationId,
		senderId: data.senderId,
		content: data.content,
		imgUrl: data.imgUrl,
		createdAt: data.createdAt?.toDate() || new Date(),
		updatedAt: data.updatedAt?.toDate(),
	};
};

/**
 * Create a new message
 */
export const createMessage = async (
	data: MessageCreateData,
): Promise<Message> => {
	const { conversationId, senderId, content, imgUrl } = data;

	// Validate message has content or image
	if (!content && !imgUrl) {
		throw createServiceError(
			'Message must have either content or image',
			ErrorCode.VALIDATION_ERROR,
		);
	}

	// Verify sender is participant of conversation
	const conversation = await getConversationById(conversationId, senderId);

	const now = new Date();
	const messageData = {
		conversationId,
		senderId,
		content: content || null,
		imgUrl: imgUrl || null,
		createdAt: Timestamp.fromDate(now),
	};

	const messageRef = await db.collection('messages').add(messageData);

	// Update conversation's last message and unread counts
	const participantIds = conversation.participants.map((p) => p.userId);
	const unreadUpdates: any = {};

	participantIds.forEach((userId) => {
		if (userId !== senderId) {
			unreadUpdates[`unreadCounts.${userId}`] = FieldValue.increment(1);
		}
	});

	await db
		.collection('conversations')
		.doc(conversationId)
		.update({
			lastMessage: {
				id: messageRef.id,
				content: content || null,
				senderId,
				createdAt: Timestamp.fromDate(now),
			},
			lastMessageAt: Timestamp.fromDate(now),
			seenBy: [senderId], // Only sender has seen it initially
			...unreadUpdates,
		});

	return convertFirestoreToMessage(messageRef.id, messageData);
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
	params: MessagesQueryParams,
	userId: string,
): Promise<any[]> => {
	const { conversationId, limit = 50, before, after } = params;

	// Verify user is participant
	await getConversationById(conversationId, userId);

	let query = db
		.collection('messages')
		.where('conversationId', '==', conversationId);

	// Filter by timestamp if provided
	if (before) {
		query = query.where('createdAt', '<', Timestamp.fromDate(before));
	}

	if (after) {
		query = query.where('createdAt', '>', Timestamp.fromDate(after));
	}

	const messagesSnapshot = await query.get();

	const messages = messagesSnapshot.docs.map((doc) =>
		convertFirestoreToMessage(doc.id, doc.data()),
	);

	// Sort by createdAt (newest first for pagination, oldest first for display)
	messages.sort((a, b) => {
		if (before) {
			return b.createdAt.getTime() - a.createdAt.getTime(); // Newest first for "load more"
		}
		return a.createdAt.getTime() - b.createdAt.getTime(); // Oldest first for initial load
	});

	// Limit results
	const limitedMessages = messages.slice(0, limit);

	// Populate sender details
	const messagesWithSender = await Promise.all(
		limitedMessages.map(async (message) => {
			const sender = await getUserDocument(message.senderId);
			return {
				...message,
				sender,
			};
		}),
	);

	return messagesWithSender;
};

/**
 * Get message by ID
 */
export const getMessageById = async (
	messageId: string,
	userId: string,
): Promise<Message> => {
	const messageDoc = await db.collection('messages').doc(messageId).get();

	if (!messageDoc.exists) {
		throw createServiceError('Message not found', ErrorCode.NOT_FOUND);
	}

	const message = convertFirestoreToMessage(messageDoc.id, messageDoc.data());

	// Verify user is participant of the conversation
	await getConversationById(message.conversationId, userId);

	return message;
};

/**
 * Update message (edit content)
 */
export const updateMessage = async (
	messageId: string,
	userId: string,
	data: MessageUpdateData,
): Promise<Message> => {
	const message = await getMessageById(messageId, userId);

	// Only sender can update message
	if (message.senderId !== userId) {
		throw createServiceError(
			'You can only edit your own messages',
			ErrorCode.FORBIDDEN,
		);
	}

	const now = new Date();
	const updateData: any = {
		updatedAt: Timestamp.fromDate(now),
	};

	if (data.content !== undefined) {
		updateData.content = data.content;
	}

	if (data.imgUrl !== undefined) {
		updateData.imgUrl = data.imgUrl;
	}

	await db.collection('messages').doc(messageId).update(updateData);

	// Update last message in conversation if this is the last message
	const conversation = await getConversationById(message.conversationId, userId);
	if (conversation.lastMessage?.id === messageId) {
		await db
			.collection('conversations')
			.doc(message.conversationId)
			.update({
				'lastMessage.content': data.content || message.content,
			});
	}

	return getMessageById(messageId, userId);
};

/**
 * Delete message
 */
export const deleteMessage = async (
	messageId: string,
	userId: string,
): Promise<void> => {
	const message = await getMessageById(messageId, userId);

	// Only sender can delete message
	if (message.senderId !== userId) {
		throw createServiceError(
			'You can only delete your own messages',
			ErrorCode.FORBIDDEN,
		);
	}

	await db.collection('messages').doc(messageId).delete();

	// Update last message in conversation if this was the last message
	const conversation = await getConversationById(message.conversationId, userId);
	if (conversation.lastMessage?.id === messageId) {
		// Find the new last message
		const messagesSnapshot = await db
			.collection('messages')
			.where('conversationId', '==', message.conversationId)
			.get();

		const remainingMessages = messagesSnapshot.docs
			.map((doc) => convertFirestoreToMessage(doc.id, doc.data()))
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		if (remainingMessages.length > 0) {
			const newLastMessage = remainingMessages[0];
			await db
				.collection('conversations')
				.doc(message.conversationId)
				.update({
					lastMessage: {
						id: newLastMessage.id,
						content: newLastMessage.content,
						senderId: newLastMessage.senderId,
						createdAt: Timestamp.fromDate(newLastMessage.createdAt),
					},
					lastMessageAt: Timestamp.fromDate(newLastMessage.createdAt),
				});
		} else {
			// No messages left
			await db
				.collection('conversations')
				.doc(message.conversationId)
				.update({
					lastMessage: null,
					lastMessageAt: FieldValue.delete(),
				});
		}
	}
};
