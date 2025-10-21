import { Request, Response } from 'express';

import { db } from '../configs/firebase.config';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@repo/types';

type MessageReaction = {
  id: string;
  url: string;
  description?: string;
};

const USERS_COLLECTION = 'users';
const CHAT_ROOM_COLLECTION = 'chats';
const GROUP_CHAT_ROOM_COLLECTION = 'groups';
const MESSAGE_COLLECTION = 'messages';

// Interface for chat collections
interface ChatData {
  participantIds?: string[];
  memberIds?: string[];
  adminId?: string;
  subAdminIds?: string[];
  pinnedContent?: string[];
  [key: string]: any;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  [key: string]: any;
}

// Helper function to get the correct collection based on chat type
const getChatCollection = async (chatId: string) => {
  // Try to find the chat in peer chats first
  const peerChatDoc = await db.collection(CHAT_ROOM_COLLECTION).doc(chatId).get();

  if (peerChatDoc.exists) {
    return {
      collection: db.collection(CHAT_ROOM_COLLECTION),
      type: 'peer',
      data: peerChatDoc.data() as ChatData
    };
  }

  // If not found in peer chats, try group chats
  const groupChatDoc = await db.collection(GROUP_CHAT_ROOM_COLLECTION).doc(chatId).get();

  if (groupChatDoc.exists) {
    return {
      collection: db.collection(GROUP_CHAT_ROOM_COLLECTION),
      type: 'group',
      data: groupChatDoc.data() as ChatData
    };
  }

  // If not found in either, return null
  return null;
};

// Get messages from a chat room by id with pagination (limit 20 by default)
export const getMessages = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.uid;
    const { chatId } = req.params;
    const { limit = 20, lastMessageId } = req.query;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required',
      });
    }

    // Verify that the chat exists and get the correct collection
    const chatInfo = await getChatCollection(chatId);
    if (!chatInfo) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const { collection, type, data: chatData } = chatInfo;

    // Check if user is a participant in this chat
    if (type === 'peer' && chatData && !chatData.participantIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this chat',
      });
    } else if (type === 'group' && chatData && !chatData.memberIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    // Build query for messages
    let messagesQuery = db.collection(MESSAGE_COLLECTION)
      .where('chatId', '==', chatId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit as string));

    // Apply pagination if lastMessageId is provided
    if (lastMessageId) {
      const lastMessageDoc = await db.collection(MESSAGE_COLLECTION).doc(lastMessageId as string).get();
      if (lastMessageDoc.exists) {
        messagesQuery = messagesQuery.startAfter(lastMessageDoc);
      }
    }

    const messagesSnapshot = await messagesQuery.get();

    if (messagesSnapshot.empty) {
      return res.status(200).json({
        success: true,
        message: 'No messages found',
        data: {
          messages: [],
          hasMore: false
        }
      });
    }

    const messages = messagesSnapshot.docs.map(doc => {
      const messageData = doc.data() as Message;
      return {
        ...messageData,
        id: doc.id
      };
    });

    // Check if there are more messages
    const hasMore = messages.length === parseInt(limit as string);

    return res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages,
        hasMore
      }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Send a message to a chat room
export const sendMessage = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.uid;
    const { chatId } = req.params;
    const { content, messageType = 'text', replyTo, mentions } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required',
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    // Verify that the chat exists and get the correct collection
    const chatInfo = await getChatCollection(chatId);
    if (!chatInfo) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const { collection, type, data: chatData } = chatInfo;

    // Check if user is a participant in this chat
    if (type === 'peer' && chatData && !chatData.participantIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages to this chat',
      });
    } else if (type === 'group' && chatData && !chatData.memberIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    // Get sender info
    const senderDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
    if (!senderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found',
      });
    }
    const senderData = senderDoc.data() as UserData;

    // Create message
    const messageId = uuidv4();
    const message: Message = {
      id: messageId,
      chatId,
      type: 'message',
      messageType: messageType as any,
      content,
      senderId: userId,
      senderName: `${senderData?.firstName || ''} ${senderData?.lastName || ''}`.trim(),
      deliveryStatus: 'sent',
      timestamp: new Date(),
      isRemoved: false,
    };

    // Add optional fields if provided
    if (replyTo) {
      message.replyTo = replyTo;
    }

    if (mentions && Array.isArray(mentions)) {
      message.mentions = mentions;
    }

    // Save message to Firestore
    await db.collection(MESSAGE_COLLECTION).doc(messageId).set(message);

    // Update chat's lastUpdate timestamp
    await collection.doc(chatId).update({
      lastUpdate: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Share a message to another chat
export const shareMessage = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.uid;
    const { chatId } = req.params;
    const { messageId, targetChatId } = req.body;

    if (!chatId || !messageId || !targetChatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID, message ID, and target chat ID are required',
      });
    }

    // Check if source message exists
    const messageDoc = await db.collection(MESSAGE_COLLECTION).doc(messageId).get();
    if (!messageDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const messageData = messageDoc.data() as Message;

    // Check if target chat exists and user has permission
    const targetChatInfo = await getChatCollection(targetChatId);
    if (!targetChatInfo) {
      return res.status(404).json({
        success: false,
        message: 'Target chat not found',
      });
    }

    const { collection, type, data: targetChatData } = targetChatInfo;

    // Verify user has permission to send to target chat
    if (type === 'peer' && targetChatData && !targetChatData.participantIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages to the target chat',
      });
    } else if (type === 'group' && targetChatData && !targetChatData.memberIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of the target group',
      });
    }

    // Get sender info
    const senderDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
    const senderData = senderDoc.data() as UserData;

    // Create new message as a share
    const newMessageId = uuidv4();
    const sharedMessage: Message = {
      id: newMessageId,
      chatId: targetChatId,
      type: 'message',
      messageType: messageData.messageType,
      content: messageData.content,
      senderId: userId,
      senderName: `${senderData?.firstName || ''} ${senderData?.lastName || ''}`.trim(),
      deliveryStatus: 'sent',
      timestamp: new Date(),
      replyTo: messageId, // Reference the original message
      isRemoved: false,
    };

    // Save shared message to Firestore
    await db.collection(MESSAGE_COLLECTION).doc(newMessageId).set(sharedMessage);

    // Update target chat's lastUpdate timestamp
    await collection.doc(targetChatId).update({
      lastUpdate: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Message shared successfully',
      data: sharedMessage
    });
  } catch (error) {
    console.error('Error sharing message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to share message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Recall (delete/edit) a message
export const recallMessage = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.uid;
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
    }

    // Check if message exists
    const messageDoc = await db.collection(MESSAGE_COLLECTION).doc(messageId).get();
    if (!messageDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const messageData = messageDoc.data() as Message;

    // Check if user is the sender of the message
    if (messageData.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only recall your own messages',
      });
    }

    // Mark message as removed
    await db.collection(MESSAGE_COLLECTION).doc(messageId).update({
      isRemoved: true
    });

    return res.status(200).json({
      success: true,
      message: 'Message recalled successfully',
    });
  } catch (error) {
    console.error('Error recalling message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to recall message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Add a reaction to a message
export const addReaction = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.uid;
    const { messageId } = req.params;
    const { reaction } = req.body;

    if (!messageId || !reaction) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and reaction are required',
      });
    }

    if (!reaction.url) {
      return res.status(400).json({
        success: false,
        message: 'Reaction URL is required',
      });
    }

    // Check if message exists
    const messageDoc = await db.collection(MESSAGE_COLLECTION).doc(messageId).get();
    if (!messageDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const messageData = messageDoc.data() as Message;

    // Get the chat to verify user has permission
    const chatInfo = await getChatCollection(messageData.chatId);
    if (!chatInfo) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const { collection, type, data: chatData } = chatInfo;

    // Verify user has permission to react in this chat
    if (type === 'peer' && chatData && !chatData.participantIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to react in this chat',
      });
    } else if (type === 'group' && chatData && !chatData.memberIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    // Check if reactions array exists, if not initialize it
    const currentReactions = messageData.reactions || [];

    // Check if user already has a reaction and remove it
    const userReactionIndex = currentReactions.findIndex(r => r.id === userId);

    if (userReactionIndex >= 0) {
      currentReactions.splice(userReactionIndex, 1);
    }

    // Add the new reaction
    const newReaction: MessageReaction = {
      id: userId,
      url: reaction.url,
      description: reaction.description
    };

    currentReactions.push(newReaction);

    // Update the message
    await db.collection(MESSAGE_COLLECTION).doc(messageId).update({
      reactions: currentReactions
    });

    return res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
      data: {
        messageId,
        reactions: currentReactions
      }
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Remove a reaction from a message
export const removeReaction = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.uid;
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
    }

    // Check if message exists
    const messageDoc = await db.collection(MESSAGE_COLLECTION).doc(messageId).get();
    if (!messageDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const messageData = messageDoc.data() as Message;

    // Get the chat to verify user has permission
    const chatInfo = await getChatCollection(messageData.chatId);
    if (!chatInfo) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const { collection, type, data: chatData } = chatInfo;

    // Verify user has permission to remove reaction in this chat
    if (type === 'peer' && chatData && !chatData.participantIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to react in this chat',
      });
    } else if (type === 'group' && chatData && !chatData.memberIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    // Check if reactions array exists
    const currentReactions = messageData.reactions || [];

    // Check if user has a reaction
    const userReactionIndex = currentReactions.findIndex(r => r.id === userId);

    if (userReactionIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'You have not reacted to this message',
      });
    }

    // Remove the user's reaction
    currentReactions.splice(userReactionIndex, 1);

    // Update the message
    await db.collection(MESSAGE_COLLECTION).doc(messageId).update({
      reactions: currentReactions
    });

    return res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
      data: {
        messageId,
        reactions: currentReactions
      }
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Pin a message
export const pinMessage = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.uid;
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
    }

    // Check if message exists
    const messageDoc = await db.collection(MESSAGE_COLLECTION).doc(messageId).get();
    if (!messageDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const messageData = messageDoc.data() as Message;

    // Get the chat to verify user has permission
    const chatInfo = await getChatCollection(messageData.chatId);
    if (!chatInfo) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const { collection, type, data: chatData } = chatInfo;

    // Verify user has permission to pin in this chat
    if (type === 'peer' && chatData && !chatData.participantIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to pin messages in this chat',
      });
    } else if (type === 'group' && chatData) {
      // In groups, only admin and sub-admins can pin messages
      const isAdmin = chatData.adminId === userId;
      const isSubAdmin = chatData.subAdminIds?.includes(userId) || false;

      if (!isAdmin && !isSubAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only admins and sub-admins can pin messages in a group chat',
        });
      }
    }

    // Get current pinned content
    const pinnedContent = chatData?.pinnedContent || [];

    // Check if message is already pinned
    if (pinnedContent.includes(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Message is already pinned',
      });
    }

    // Add message to pinned content (with a limit of 3 pinned messages)
    if (pinnedContent.length >= 3) {
      pinnedContent.shift(); // Remove oldest pin
    }

    pinnedContent.push(messageId);

    // Update the chat
    await collection.doc(messageData.chatId).update({
      pinnedContent
    });

    return res.status(200).json({
      success: true,
      message: 'Message pinned successfully',
      data: {
        pinnedContent
      }
    });
  } catch (error) {
    console.error('Error pinning message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to pin message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Unpin a message
export const unpinMessage = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.uid;
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
    }

    // Check if message exists
    const messageDoc = await db.collection(MESSAGE_COLLECTION).doc(messageId).get();
    if (!messageDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const messageData = messageDoc.data() as Message;

    // Get the chat to verify user has permission
    const chatInfo = await getChatCollection(messageData.chatId);
    if (!chatInfo) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const { collection, type, data: chatData } = chatInfo;

    // Verify user has permission to unpin in this chat
    if (type === 'peer' && chatData && !chatData.participantIds?.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to unpin messages in this chat',
      });
    } else if (type === 'group' && chatData) {
      // In groups, only admin and sub-admins can unpin messages
      const isAdmin = chatData.adminId === userId;
      const isSubAdmin = chatData.subAdminIds?.includes(userId) || false;

      if (!isAdmin && !isSubAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only admins and sub-admins can unpin messages in a group chat',
        });
      }
    }

    // Get current pinned content
    const pinnedContent = chatData?.pinnedContent || [];

    // Check if message is pinned
    const messageIndex = pinnedContent.indexOf(messageId);
    if (messageIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Message is not pinned',
      });
    }

    // Remove message from pinned content
    pinnedContent.splice(messageIndex, 1);

    // Update the chat
    await collection.doc(messageData.chatId).update({
      pinnedContent
    });

    return res.status(200).json({
      success: true,
      message: 'Message unpinned successfully',
      data: {
        pinnedContent
      }
    });
  } catch (error) {
    console.error('Error unpinning message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unpin message',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
