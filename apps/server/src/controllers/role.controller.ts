import { NextFunction, Request, Response } from 'express';
import { AppError } from '../types';
import { ok, created, noContent } from '../types/response';
import {
	getRolesService,
	getRoleByIdService,
	createRoleService,
	updateRoleService,
	deleteRoleService,
	updateRolePermissionsService,
} from '../services/role.service';
import { createRoleSchema, updateRoleSchema, updateRolePermissionsSchema, validateRequest } from '../validations/role.validation';
import { handleRoleServiceError } from '../errors/role.handler';
import { ErrorCode, ErrorMessage } from '../constants/errors';

export const getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { active } = req.query;
		const activeFilter = active !== undefined ? active === 'true' : undefined;

		const result = await getRolesService({ active: activeFilter });

		ok(res, result.roles);
	} catch (error: any) {
		return next(handleRoleServiceError(error));
	}
};

export const getRoleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { id } = req.params;

	try {
		const role = await getRoleByIdService(id);

		if (!role) {
			return next(new AppError(`Role with id=${id} not found`, 404, ErrorCode.ROLE_NOT_FOUND));
		}

		ok(res, role);
	} catch (error: any) {
		return next(handleRoleServiceError(error, { id }));
	}
};

export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const validatedData = await validateRequest(createRoleSchema, req.body);

		const role = await createRoleService(
			validatedData,
			req.user?.uid || 'system',
		);

		created(res, role, `/api/roles/${role.id}`);
	} catch (error: any) {
		return next(handleRoleServiceError(error));
	}
};

export const updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { id } = req.params;

	try {
		const validatedData = await validateRequest(updateRoleSchema, req.body);

		const updatedRole = await updateRoleService(
			id,
			validatedData,
			req.user?.uid || 'system',
		);

		ok(res, updatedRole);
	} catch (error: any) {
		return next(handleRoleServiceError(error, { id }));
	}
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { id } = req.params;

	try {
		await deleteRoleService(id);

		noContent(res);
	} catch (error: any) {
		return next(handleRoleServiceError(error, { id }));
	}
};

export const updateRolePermissions = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const { id } = req.params;

	try {
		const validatedData = await validateRequest(updateRolePermissionsSchema, req.body);

		const result = await updateRolePermissionsService(
			id,
			validatedData.permissionIds,
			req.user?.uid || 'system',
		);

		ok(res, result);
	} catch (error: any) {
		return next(handleRoleServiceError(error, { id }));
	}
};
