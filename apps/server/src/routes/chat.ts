import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { addUserToGroupChat, createGroupChat, createPeerChatRoom, getChatConversation, grantGroupMemberPermission, removeUserFromGroupChat, sendRequestJoinChatRoom } from '../controllers/chat.controller';

export const chatRouter = express.Router();

chatRouter.use(authMiddleware())
/**
 * get user chat conversations (meta-data)
 */
chatRouter.get('/', getChatConversation);
/**
 * create a chat room (peer).
 */
chatRouter.post('/peer', createPeerChatRoom);
/**
 * user send request to join a group chat.
 */
chatRouter.post('/group/:chat-id', sendRequestJoinChatRoom);
/**
 * create a group chat
 */
chatRouter.post('/group', createGroupChat);
/**
 * add a user to group chat
 */
chatRouter.post('/group/add/:chat-id', addUserToGroupChat);
/**
 * remove a user out of group chat
*/
chatRouter.delete('/group/:chat-id', removeUserFromGroupChat);
/**
 * grant user permission
 */
chatRouter.post('/group/grant/:chat-id', grantGroupMemberPermission);
