import { Request, Response } from 'express';
import { db, bucket } from '../configs/firebase.config';

const INVITATION_COLLECTION = 'invitations';
const CHAT_ROOM_COLLECTION = 'chats';
const GROUP_CHAT_ROOM_COLLECTION = 'groups';

export const getChatConversation = async (
	req: Request & { user?: any },
	res: Response,
) => {};

export const createPeerChatRoom = async (
	req: Request & { user?: any },
	res: Response,
) => {};

export const sendRequestJoinChatRoom = async (
	req: Request & { user?: any },
	res: Response,
) => {};

export const createGroupChat = async (
	req: Request & { user?: any },
	res: Response,
) => {};

export const getChatInfo = async (req: Request & { user?: any }, res: Response) => {};
export const addUserToGroupChat = async (
	req: Request & { user?: any },
	res: Response,
) => {};

export const removeUserFromGroupChat = async (
	req: Request & { user?: any },
	res: Response,
) => {};

export const grantGroupMemberPermission = async (
	req: Request & { user?: any },
	res: Response,
) => {};
