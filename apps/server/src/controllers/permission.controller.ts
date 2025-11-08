import { NextFunction, Request, Response } from 'express';
import { db } from '../configs/firebase';
import { AppError } from '../types';
import { ok, created, noContent } from '../types/response';
import { createPermissionDocument, updatePermissionDocument } from '../services/permission.service';
import { createPermissionSchema, updatePermissionSchema, validateRequest } from '../validations/permission.validation';

export const getPermissions = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { module, active } = req.query;

		let query: any = db.collection('permissions');

		if (module) {
			query = query.where('module', '==', module);
		}

		if (active !== undefined) {
			const isActive = active === 'true';
			query = query.where('active', '==', isActive);
		}

		const snapshot = await query.get();
		const permissions = snapshot.docs.map((doc: any) => ({
			id: doc.id,
			...doc.data(),
		}));

		ok(res, permissions);
	} catch (error: any) {
		return next(error);
	}
};

export const getPermissionById = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id } = req.params;

		const permissionDoc = await db.collection('permissions').doc(id).get();

		if (!permissionDoc.exists) {
			return next(new AppError(`Permission with id=${id} not found`, 404, 'PERMISSION_NOT_FOUND'));
		}

		ok(res, {
			id: permissionDoc.id,
			...permissionDoc.data(),
		});
	} catch (error: any) {
		return next(error);
	}
};

export const createPermission = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const validatedData = await validateRequest(createPermissionSchema, req.body);

		const existingPermissions = await db
			.collection('permissions')
			.where('apiPath', '==', validatedData.apiPath)
			.where('method', '==', validatedData.method)
			.get();

		if (!existingPermissions.empty) {
			return next(
				new AppError('Permission already exists for this API path and method', 409, 'PERMISSION_EXISTS'),
			);
		}

		const permission = await createPermissionDocument({
			...validatedData,
			createdBy: req.user?.uid || 'system',
		});

		created(res, permission, `/api/permissions/${permission.id}`);
	} catch (error: any) {
		return next(error);
	}
};

export const updatePermission = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id } = req.params;
		const validatedData = await validateRequest(updatePermissionSchema, req.body);

		const permissionDoc = await db.collection('permissions').doc(id).get();

		if (!permissionDoc.exists) {
			return next(new AppError(`Permission with id=${id} not found`, 404, 'PERMISSION_NOT_FOUND'));
		}

		if (validatedData.apiPath !== undefined || validatedData.method !== undefined) {
			const checkApiPath = validatedData.apiPath || permissionDoc.data()?.apiPath;
			const checkMethod = validatedData.method || permissionDoc.data()?.method;

			const existingPermissions = await db
				.collection('permissions')
				.where('apiPath', '==', checkApiPath)
				.where('method', '==', checkMethod)
				.get();

			const isDuplicate = existingPermissions.docs.some((doc) => doc.id !== id);
			if (isDuplicate) {
				return next(
					new AppError('Permission already exists for this API path and method', 409, 'PERMISSION_EXISTS'),
				);
			}
		}

		const updatedPermission = await updatePermissionDocument(id, validatedData, req.user?.uid || 'system');

		ok(res, updatedPermission);
	} catch (error: any) {
		return next(error);
	}
};

export const deletePermission = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id } = req.params;

		const permissionDoc = await db.collection('permissions').doc(id).get();

		if (!permissionDoc.exists) {
			return next(new AppError(`Permission with id=${id} not found`, 404, 'PERMISSION_NOT_FOUND'));
		}

		const rolesSnapshot = await db.collection('roles').get();
		const rolesUsingPermission = rolesSnapshot.docs.filter((doc) => {
			const permissionIds = doc.data()?.permissionIds || [];
			return permissionIds.includes(id);
		});

		if (rolesUsingPermission.length > 0) {
			return next(
				new AppError(
					'Cannot delete permission that is assigned to roles. Please remove it from roles first.',
					409,
					'PERMISSION_IN_USE',
				),
			);
		}

		await db.collection('permissions').doc(id).delete();

		noContent(res);
	} catch (error: any) {
		return next(error);
	}
};
