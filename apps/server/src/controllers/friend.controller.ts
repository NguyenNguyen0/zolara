import { NextFunction, Request, Response } from 'express';
import { AppError } from '../types';
import { ok, created, noContent } from '../types/response';
import {
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	getFriendList,
	getFriendRequests,
	getSentFriendRequests,
	removeFriend,
	cancelFriendRequest,
	getFriendSuggestions,
} from '../services/friend.service';
import {
	sendFriendRequestSchema,
	handleFriendRequestSchema,
	friendSuggestionsSchema,
	validateRequest,
} from '../validations/friend.validation';
import { ErrorCode, ErrorMessage } from '../constants/errors';
import { handleFriendServiceError } from '../errors/friend.handler';

/**
 * Send friend request
 * POST /api/friends
 */
export const addFriend = async (
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

		const validatedData = await validateRequest(sendFriendRequestSchema, req.body);
		const toUserId = validatedData.toUserId as string;
		const message = validatedData.message as string | undefined;

		const friendRequest = await sendFriendRequest({
			from: req.user.uid,
			to: toUserId,
			message,
		});

		created(res, friendRequest, 'Friend request sent successfully');
	} catch (error: any) {
		return next(handleFriendServiceError(error));
	}
};

/**
 * Accept or reject friend request
 * PUT /api/friends/:requestId
 */
export const respondToFriendRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { requestId } = req.params;

	try {
		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		const validatedData = await validateRequest(handleFriendRequestSchema, req.body);
		const action = validatedData.action as 'accept' | 'reject';

		if (action === 'accept') {
			const result = await acceptFriendRequest(requestId, req.user.uid);
			ok(res, result, 'Friend request accepted');
		} else {
			const result = await rejectFriendRequest(requestId, req.user.uid);
			ok(res, result, 'Friend request rejected');
		}
	} catch (error: any) {
		return next(handleFriendServiceError(error, { requestId }));
	}
};

/**
 * Get friend list
 * GET /api/friends
 */
export const getFriends = async (
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

		const friends = await getFriendList(req.user.uid);
		ok(res, friends);
	} catch (error: any) {
		return next(handleFriendServiceError(error));
	}
};

/**
 * Get pending friend requests (received)
 * GET /api/friends/requests
 */
export const getReceivedRequests = async (
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

		const requests = await getFriendRequests(req.user.uid);
		ok(res, requests);
	} catch (error: any) {
		return next(handleFriendServiceError(error));
	}
};

/**
 * Get sent friend requests
 * GET /api/friends/sent
 */
export const getSentRequests = async (
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

		const requests = await getSentFriendRequests(req.user.uid);
		ok(res, requests);
	} catch (error: any) {
		return next(handleFriendServiceError(error));
	}
};

/**
 * Remove friend
 * DELETE /api/friends/:friendId
 */
export const deleteFriend = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { friendId } = req.params;

	try {
		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		await removeFriend(req.user.uid, friendId);
		noContent(res);
	} catch (error: any) {
		return next(handleFriendServiceError(error, { friendId }));
	}
};

/**
 * Cancel friend request
 * DELETE /api/friends/requests/:requestId
 */
export const cancelRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { requestId } = req.params;

	try {
		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		await cancelFriendRequest(requestId, req.user.uid);
		noContent(res);
	} catch (error: any) {
		return next(handleFriendServiceError(error, { requestId }));
	}
};

/**
 * Get friend suggestions
 * GET /api/friends/suggestions
 */
export const getSuggestions = async (
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

		const validatedData = await validateRequest(friendSuggestionsSchema, req.query);
		const limit = validatedData.limit ? parseInt(validatedData.limit as string, 10) : 10;
		const suggestions = await getFriendSuggestions(req.user.uid, limit);

		ok(res, suggestions);
	} catch (error: any) {
		return next(handleFriendServiceError(error));
	}
};

