import { NextFunction, Request, Response } from 'express';
import { AppError } from '../types';
import { ok, noContent } from '../types/response';
import {
	getUsersWithPagination,
	getUserByIdWithRole,
	updateUserService,
	updateUserRole,
	toggleUserLock,
	deleteUserService,
	populateUsersWithRoles,
} from '../services/user.service';
import {
	updateUserSchema,
	updateRoleSchema,
	toggleLockSchema,
	validateRequest,
} from '../validations/user.validation';
import { populateRole } from '../utils/helpers';
import { ErrorCode, ErrorMessage } from '../constants/errors';
import { handleUserServiceError } from '../errors/user.handler';

export const getUsers = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 20;
		const isLocked =
			req.query.isLocked !== undefined
				? req.query.isLocked === 'true'
				: undefined;

		const result = await getUsersWithPagination({
			page,
			pageSize,
			isLocked,
		});

		// Populate roles for all users
		const usersWithRoles = await populateUsersWithRoles(result.users);

		ok(
			res,
			usersWithRoles,
			{
				total: result.total,
				page: result.page,
				pageSize: result.pageSize,
			},
			{
				self: `/api/users?page=${result.page}&pageSize=${result.pageSize}`,
				next:
					result.page * result.pageSize < result.total
						? `/api/users?page=${result.page + 1}&pageSize=${result.pageSize}`
						: undefined,
				prev:
					result.page > 1
						? `/api/users?page=${result.page - 1}&pageSize=${result.pageSize}`
						: undefined,
			},
		);
	} catch (error: any) {
		return next(error);
	}
};

export const getUserById = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		const user = await getUserByIdWithRole(id);

		if (!user) {
			return next(
				new AppError(
					`User with id=${id} not found`,
					404,
					ErrorCode.USER_NOT_FOUND,
				),
			);
		}

		const role = await populateRole(user.roleId);

		ok(res, {
			...user,
			role,
		});
	} catch (error: any) {
		return next(handleUserServiceError(error, { id }));
	}
};

export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		const validatedData = await validateRequest(updateUserSchema, req.body);

		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		// Authorization check
		if (req.user.role !== 'ADMIN' && req.user.uid !== id) {
			return next(
				new AppError('You can only update your own profile', 403, ErrorCode.FORBIDDEN),
			);
		}

		const updatedUser = await updateUserService(
			id,
			validatedData,
			req.user.uid,
			req.user.role === 'ADMIN',
			req.user.uid,
		);
		const role = await populateRole(updatedUser.roleId);

		ok(res, {
			...updatedUser,
			role,
		});
	} catch (error: any) {
		return next(handleUserServiceError(error, { id }));
	}
};

export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		await deleteUserService(id);
		noContent(res);
	} catch (error: any) {
		return next(handleUserServiceError(error, { id }));
	}
};

export const updateRole = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		const validatedData = await validateRequest(updateRoleSchema, req.body);
		const { roleId } = validatedData;

		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		const { user, roleName } = await updateUserRole(
			id,
			roleId,
			req.user.uid,
		);
		const role = await populateRole(user.roleId);

		ok(res, {
			...user,
			role,
			message: 'User role updated successfully',
		});
	} catch (error: any) {
		return next(handleUserServiceError(error, { id }));
	}
};

export const toggleLock = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		const validatedData = await validateRequest(toggleLockSchema, req.body);
		const { isLocked } = validatedData;

		if (!req.user) {
			return next(
				new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED),
			);
		}

		const updatedUser = await toggleUserLock(
			id,
			isLocked,
			req.user.uid,
		);
		const role = await populateRole(updatedUser.roleId);

		ok(res, {
			...updatedUser,
			role,
			message: isLocked
				? 'User account locked'
				: 'User account unlocked',
		});
	} catch (error: any) {
		return next(handleUserServiceError(error, { id }));
	}
};
