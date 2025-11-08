import { NextFunction, Request, Response } from 'express';
import { AppError } from '../types';
import { ok, created, noContent } from '../types/response';
import {
	getPermissionsService,
	getPermissionByIdService,
	createPermissionService,
	updatePermissionService,
	deletePermissionService,
} from '../services/permission.service';
import { createPermissionSchema, updatePermissionSchema, validateRequest } from '../validations/permission.validation';
import { handlePermissionServiceError } from '../errors/permission.handler';
import { ErrorCode, ErrorMessage } from '../constants/errors';

export const getPermissions = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { module, active } = req.query;
		const moduleFilter = module as string | undefined;
		const activeFilter = active !== undefined ? active === 'true' : undefined;

		const result = await getPermissionsService({
			module: moduleFilter,
			active: activeFilter,
		});

		ok(res, result.permissions);
	} catch (error: any) {
		return next(handlePermissionServiceError(error));
	}
};

export const getPermissionById = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		const permission = await getPermissionByIdService(id);

		if (!permission) {
			return next(new AppError(`Permission with id=${id} not found`, 404, ErrorCode.PERMISSION_NOT_FOUND));
		}

		ok(res, permission);
	} catch (error: any) {
		return next(handlePermissionServiceError(error, { id }));
	}
};

export const createPermission = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const validatedData = await validateRequest(createPermissionSchema, req.body);

		const permission = await createPermissionService(
			validatedData,
			req.user?.uid || 'system',
		);

		created(res, permission, `/api/permissions/${permission.id}`);
	} catch (error: any) {
		return next(handlePermissionServiceError(error));
	}
};

export const updatePermission = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		const validatedData = await validateRequest(updatePermissionSchema, req.body);

		const updatedPermission = await updatePermissionService(
			id,
			validatedData,
			req.user?.uid || 'system',
		);

		ok(res, updatedPermission);
	} catch (error: any) {
		return next(handlePermissionServiceError(error, { id }));
	}
};

export const deletePermission = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		await deletePermissionService(id);

		noContent(res);
	} catch (error: any) {
		return next(handlePermissionServiceError(error, { id }));
	}
};
