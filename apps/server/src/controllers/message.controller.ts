import { NextFunction, Request, Response } from 'express';
import { AppError } from '../types';
import { ok, created, noContent } from '../types/response';
import {
	createMessage,
	getMessages,
	getMessageById,
	updateMessage,
	deleteMessage,
} from '../services/message.service';
import {
	createMessageSchema,
	updateMessageSchema,
	getMessagesSchema,
	validateRequest,
} from '../validations/message.validation';
import { ErrorCode, ErrorMessage } from '../constants/errors';
import { handleMessageServiceError } from '../errors/message.handler';

/**
 * Create message
 * POST /api/messages
 */
export const sendMessage = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		const validatedData = await validateRequest(createMessageSchema, req.body);

		const message = await createMessage({
			conversationId: validatedData.conversationId as string,
			senderId: req.user.uid,
			content: validatedData.content as string,
			imgUrl: validatedData.imgUrl as string,
		});

		created(res, message, 'Message sent successfully');
	} catch (error: any) {
		return next(handleMessageServiceError(error));
	}
};

/**
 * Get messages for a conversation
 * GET /api/conversations/:conversationId/messages
 */
export const getConversationMessages = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { conversationId } = req.params;

	try {
		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		const validatedData = await validateRequest(getMessagesSchema, req.query);

		const messages = await getMessages(
			{
				conversationId,
				limit: validatedData.limit ? parseInt(validatedData.limit as string, 10) : 50,
				before: validatedData.before ? new Date(validatedData.before as string) : undefined,
				after: validatedData.after ? new Date(validatedData.after as string) : undefined,
			},
			req.user.uid,
		);

		ok(res, messages);
	} catch (error: any) {
		return next(handleMessageServiceError(error, { conversationId }));
	}
};

/**
 * Get message by ID
 * GET /api/messages/:id
 */
export const getMessage = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		const message = await getMessageById(id, req.user.uid);
		ok(res, message);
	} catch (error: any) {
		return next(handleMessageServiceError(error, { messageId: id }));
	}
};

/**
 * Update message
 * PUT /api/messages/:id
 */
export const editMessage = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		const validatedData = await validateRequest(updateMessageSchema, req.body);

		const message = await updateMessage(id, req.user.uid, {
			content: validatedData.content as string,
			imgUrl: validatedData.imgUrl as string,
		});

		ok(res, message, 'Message updated successfully');
	} catch (error: any) {
		return next(handleMessageServiceError(error, { messageId: id }));
	}
};

/**
 * Delete message
 * DELETE /api/messages/:id
 */
export const removeMessage = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		await deleteMessage(id, req.user.uid);
		noContent(res);
	} catch (error: any) {
		return next(handleMessageServiceError(error, { messageId: id }));
	}
};
