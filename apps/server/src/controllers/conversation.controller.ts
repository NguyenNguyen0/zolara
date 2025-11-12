import { NextFunction, Request, Response } from 'express';
import { AppError } from '../types';
import { ok, created, noContent } from '../types/response';
import {
	createConversation,
	getConversationById,
	getUserConversations,
	updateConversation,
	markConversationAsSeen,
	addParticipant,
	removeParticipant,
	deleteConversation,
} from '../services/conversation.service';
import {
	createConversationSchema,
	updateConversationSchema,
	addParticipantSchema,
	validateRequest,
} from '../validations/conversation.validation';
import { ErrorCode, ErrorMessage } from '../constants/errors';
import { handleConversationServiceError } from '../errors/conversation.handler';

/**
 * Create conversation (direct or group)
 * POST /api/conversations
 */
export const createConv = async (
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

		const validatedData = await validateRequest(createConversationSchema, req.body);

		const conversation = await createConversation({
			type: validatedData.type as any,
			participantIds: validatedData.participantIds as string[],
			groupName: validatedData.groupName as string,
			groupAvatarUrl: validatedData.groupAvatarUrl as string,
			createdBy: req.user.uid,
		});

		created(res, conversation, 'Conversation created successfully');
	} catch (error: any) {
		return next(handleConversationServiceError(error));
	}
};

/**
 * Get conversation by ID
 * GET /api/conversations/:id
 */
export const getConv = async (
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

		const conversation = await getConversationById(id, req.user.uid);
		ok(res, conversation);
	} catch (error: any) {
		return next(handleConversationServiceError(error, { conversationId: id }));
	}
};

/**
 * Get all conversations for current user
 * GET /api/conversations
 */
export const getUserConvs = async (
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

		const conversations = await getUserConversations(req.user.uid);
		ok(res, conversations);
	} catch (error: any) {
		return next(handleConversationServiceError(error));
	}
};

/**
 * Update conversation (group name/avatar)
 * PUT /api/conversations/:id
 */
export const updateConv = async (
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

		const validatedData = await validateRequest(updateConversationSchema, req.body);

		const conversation = await updateConversation(id, req.user.uid, {
			groupName: validatedData.groupName as string,
			groupAvatarUrl: validatedData.groupAvatarUrl as string,
		});

		ok(res, conversation, 'Conversation updated successfully');
	} catch (error: any) {
		return next(handleConversationServiceError(error, { conversationId: id }));
	}
};

/**
 * Mark conversation as seen
 * PATCH /api/conversations/:id/seen
 */
export const markAsSeen = async (
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

		await markConversationAsSeen(id, req.user.uid);
		noContent(res);
	} catch (error: any) {
		return next(handleConversationServiceError(error, { conversationId: id }));
	}
};

/**
 * Add participant to group
 * POST /api/conversations/:id/participants
 */
export const addParticipantToGroup = async (
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

		const validatedData = await validateRequest(addParticipantSchema, req.body);
		const userId = validatedData.userId as string;

		const conversation = await addParticipant(id, req.user.uid, userId);

		ok(res, conversation, 'Participant added successfully');
	} catch (error: any) {
		return next(handleConversationServiceError(error, { conversationId: id }));
	}
};

/**
 * Remove participant from group
 * DELETE /api/conversations/:id/participants/:userId
 */
export const removeParticipantFromGroup = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id, userId } = req.params;

	try {
		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		const conversation = await removeParticipant(id, req.user.uid, userId);

		ok(res, conversation, 'Participant removed successfully');
	} catch (error: any) {
		return next(
			handleConversationServiceError(error, { conversationId: id, userId }),
		);
	}
};

/**
 * Delete conversation
 * DELETE /api/conversations/:id
 */
export const deleteConv = async (
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

		await deleteConversation(id, req.user.uid);
		noContent(res);
	} catch (error: any) {
		return next(handleConversationServiceError(error, { conversationId: id }));
	}
};
