import { Request, Response } from 'express';
import { db, bucket } from '../configs/firebase.config';

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
