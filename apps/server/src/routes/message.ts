import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getMessages,
  sendMessage,
  shareMessage,
  recallMessage,
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage
} from '../controllers/message.controller';

export const messageRouter = express.Router();

/**
 * get messages from a chat room by id (limit 20)
 */
messageRouter.get('/:chatId', authMiddleware, getMessages);

/**
 * send a message to a chat room (peer, group)
 */
messageRouter.post('/:chatId', authMiddleware, sendMessage);

/**
 * share message to another chat room (peer, group)
 */
messageRouter.post('/share/:chatId', authMiddleware, shareMessage);

/**
 * recall a message
 */
messageRouter.put('/:messageId', authMiddleware, recallMessage);

/**
 * give a reaction to a message
 */
messageRouter.post('/reaction/:messageId', authMiddleware, addReaction);

/**
 * remove reaction from a message
 */
messageRouter.delete('/reaction/:messageId', authMiddleware, removeReaction);

/**
 * pin a message
 */
messageRouter.put('/pin/:messageId', authMiddleware, pinMessage);

/**
 * unpin a message
 */
messageRouter.put('/unpin/:messageId', authMiddleware, unpinMessage);
