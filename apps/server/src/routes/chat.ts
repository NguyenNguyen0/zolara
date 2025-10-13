import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
	addUserToGroupChat,
	createGroupChat,
	createPeerChatRoom,
	getChatConversation,
	grantGroupMemberPermission,
	removeUserFromGroupChat,
	sendRequestJoinChatRoom,
	getChatInfo,
} from '../controllers/chat.controller';

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
 * create a group chat
*/
chatRouter.post('/groups', createGroupChat);
/**
 * get group chat detail info
 */
chatRouter.get('/groups/:chatId', getChatInfo)
/**
 * user send request to join a group chat.
 */
chatRouter.post('/groups/:chatId/join-requests', sendRequestJoinChatRoom);
/**
 * add a user to group chat
 */
chatRouter.post('/groups/:chatId/members', addUserToGroupChat);
/**
 * remove a user out of group chat
*/
chatRouter.delete('/groups/:chatId/members/:userId', removeUserFromGroupChat);
/**
 * grant user permission
 */
chatRouter.patch('/groups/:chatId/members/:userId/permissions', grantGroupMemberPermission);
