import { NextFunction, Request, Response } from 'express';
import { db } from '../configs/firebase';
import { AppError } from '../types';
import { ok, created, noContent } from '../types/response';
import { createRoleDocument, updateRoleDocument } from '../services/role.service';
import { createRoleSchema, updateRoleSchema, updateRolePermissionsSchema, validateRequest } from '../validations/role.validation';
import { validatePermissionIdsOrThrow, getPermissionsByIds } from '../utils/permission.helper';

export const getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { active } = req.query;

		let query: any = db.collection('roles');

		if (active !== undefined) {
			const isActive = active === 'true';
			query = query.where('active', '==', isActive);
		}

		const snapshot = await query.get();
		const roles = await Promise.all(
			snapshot.docs.map(async (doc: any) => {
				const roleData = doc.data();
				const permissionIds = roleData.permissionIds || [];
				const permissions = await getPermissionsByIds(permissionIds);

				return {
					id: doc.id,
					...roleData,
					permissions,
				};
			}),
		);

		ok(res, roles);
	} catch (error: any) {
		return next(error);
	}
};

export const getRoleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		const roleDoc = await db.collection('roles').doc(id).get();

		if (!roleDoc.exists) {
			return next(new AppError(`Role with id=${id} not found`, 404, 'ROLE_NOT_FOUND'));
		}

		const roleData = roleDoc.data();
		const permissionIds = roleData?.permissionIds || [];
		const permissions = await getPermissionsByIds(permissionIds);

		ok(res, {
			id: roleDoc.id,
			...roleData,
			permissions,
		});
	} catch (error: any) {
		return next(error);
	}
};

export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const validatedData = await validateRequest(createRoleSchema, req.body);

		if (validatedData.permissionIds && validatedData.permissionIds.length > 0) {
			await validatePermissionIdsOrThrow(validatedData.permissionIds);
		}

		const existingRoles = await db.collection('roles').where('name', '==', validatedData.name.toUpperCase()).get();
		if (!existingRoles.empty) {
			return next(new AppError('Role with this name already exists', 409, 'ROLE_EXISTS'));
		}

		const role = await createRoleDocument({
			...validatedData,
			createdBy: req.user?.uid || 'system',
		});

		created(res, role, `/api/roles/${role.id}`);
	} catch (error: any) {
		return next(error);
	}
};

export const updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;
		const validatedData = await validateRequest(updateRoleSchema, req.body);

		const roleDoc = await db.collection('roles').doc(id).get();

		if (!roleDoc.exists) {
			return next(new AppError(`Role with id=${id} not found`, 404, 'ROLE_NOT_FOUND'));
		}

		if (validatedData.name !== undefined) {
			const existingRoles = await db
				.collection('roles')
				.where('name', '==', validatedData.name.toUpperCase())
				.get();

			const isDuplicate = existingRoles.docs.some((doc) => doc.id !== id);
			if (isDuplicate) {
				return next(new AppError('Role with this name already exists', 409, 'ROLE_EXISTS'));
			}
		}

		if (validatedData.permissionIds !== undefined && validatedData.permissionIds.length > 0) {
			await validatePermissionIdsOrThrow(validatedData.permissionIds);
		}

		const updatedRole = await updateRoleDocument(id, validatedData, req.user?.uid || 'system');
		const permissions = await getPermissionsByIds(updatedRole.permissionIds || []);

		ok(res, {
			...updatedRole,
			permissions,
		});
	} catch (error: any) {
		return next(error);
	}
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		const roleDoc = await db.collection('roles').doc(id).get();

		if (!roleDoc.exists) {
			return next(new AppError(`Role with id=${id} not found`, 404, 'ROLE_NOT_FOUND'));
		}

		const usersSnapshot = await db.collection('users').where('roleId', '==', id).get();

		if (!usersSnapshot.empty) {
			return next(
				new AppError(
					'Cannot delete role that is assigned to users. Please reassign users first.',
					409,
					'ROLE_IN_USE',
				),
			);
		}

		await db.collection('roles').doc(id).delete();

		noContent(res);
	} catch (error: any) {
		return next(error);
	}
};

export const updateRolePermissions = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id } = req.params;
		const validatedData = await validateRequest(updateRolePermissionsSchema, req.body);

		const roleDoc = await db.collection('roles').doc(id).get();

		if (!roleDoc.exists) {
			return next(new AppError(`Role with id=${id} not found`, 404, 'ROLE_NOT_FOUND'));
		}

		if (validatedData.permissionIds.length > 0) {
			await validatePermissionIdsOrThrow(validatedData.permissionIds);
		}

		const updatedRole = await updateRoleDocument(
			id,
			{ permissionIds: validatedData.permissionIds },
			req.user?.uid || 'system',
		);

		const permissions = await getPermissionsByIds(validatedData.permissionIds);

		ok(res, {
			...updatedRole,
			permissions,
		});
	} catch (error: any) {
		return next(error);
	}
};
