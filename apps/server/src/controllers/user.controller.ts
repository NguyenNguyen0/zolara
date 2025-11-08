import { NextFunction, Request, Response } from 'express';
import { auth, db } from '../configs/firebase';
import { AppError } from '../types';
import { ok, noContent } from '../types/response';
import { getUserDocument, updateUserDocument } from '../services/user.service';
import { updateUserSchema, updateRoleSchema, toggleActiveSchema, validateRequest } from '../validations/user.validation';
import { populateRole } from '../utils/role.helper';

export const getUsers = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 20;
		const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
		const limit = pageSize;

		let users: any[] = [];
		let total: number;

		if (active !== undefined) {
			const allUsersSnapshot = await db.collection('users').get();
			
			const filteredUsers = allUsersSnapshot.docs
				.map((doc: any) => ({
					id: doc.id,
					...doc.data(),
				}))
				.filter((user: any) => user.active === active)
				.sort((a: any, b: any) => {
					const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
					const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
					return bDate - aDate;
				});

			total = filteredUsers.length;
			const startIndex = (page - 1) * pageSize;
			const endIndex = startIndex + pageSize;
			const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

			users = await Promise.all(
				paginatedUsers.map(async (user: any) => {
					const role = await populateRole(user.roleId);
					return {
						...user,
						role,
					};
				}),
			);
		} else {
			const usersSnapshot = await db
				.collection('users')
				.orderBy('createdAt', 'desc')
				.limit(limit)
				.get();

			total = (await db.collection('users').count().get()).data().count;

			users = await Promise.all(
				usersSnapshot.docs.map(async (doc: any) => {
					const userData = doc.data();
					const role = await populateRole(userData.roleId);
					return {
						id: doc.id,
						...userData,
						role,
					};
				}),
			);
		}

		ok(
			res,
			users,
			{
				total,
				page,
				pageSize,
			},
			{
				self: `/api/users?page=${page}&pageSize=${pageSize}`,
				next: page * pageSize < total ? `/api/users?page=${page + 1}&pageSize=${pageSize}` : undefined,
				prev: page > 1 ? `/api/users?page=${page - 1}&pageSize=${pageSize}` : undefined,
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
	try {
		const { id } = req.params;
		const userDoc = await getUserDocument(id);

		if (!userDoc) {
			return next(new AppError(`User with id=${id} not found`, 404, 'USER_NOT_FOUND'));
		}

		const role = await populateRole(userDoc.roleId);

		ok(res, {
			...userDoc,
			role,
		});
	} catch (error: any) {
		return next(error);
	}
};

export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id } = req.params;
		const validatedData = await validateRequest(updateUserSchema, req.body);

		const userDoc = await getUserDocument(id);
		if (!userDoc) {
			return next(new AppError(`User with id=${id} not found`, 404, 'USER_NOT_FOUND'));
		}

		if (!req.user) {
			return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
		}

		if (req.user.role !== 'ADMIN' && req.user.uid !== id) {
			return next(new AppError('You can only update your own profile', 403, 'FORBIDDEN'));
		}

		const updateData: any = { ...validatedData };
		if (updateData.enable !== undefined && req.user.role !== 'ADMIN') {
			delete updateData.enable;
		}
		if (updateData.active !== undefined && req.user.role !== 'ADMIN') {
			delete updateData.active;
		}

		const updatedUser = await updateUserDocument(id, updateData, req.user.uid);
		const role = await populateRole(updatedUser.roleId);

		ok(res, {
			...updatedUser,
			role,
		});
	} catch (error: any) {
		return next(error);
	}
};

export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id } = req.params;
		
		// Verify user document exists in Firestore first
		const userDoc = await getUserDocument(id);
		if (!userDoc) {
			return next(new AppError(`User with id=${id} not found`, 404, 'USER_NOT_FOUND'));
		}

		// Verify user exists in Firebase Auth before deleting
		try {
			await auth.getUser(id);
		} catch (error: any) {
			if (error.code === 'auth/user-not-found') {
				return next(new AppError('User not found in Firebase Auth', 404, 'USER_NOT_FOUND'));
			}
			throw error;
		}

		// Delete from Firestore first
		await db.collection('users').doc(id).delete();
		
		// Then delete from Firebase Auth
		try {
			await auth.deleteUser(id);
		} catch (error: any) {
			if (error.code === 'auth/user-not-found') {
				// Firestore document already deleted, but Auth user not found - this is acceptable
				// Continue with response
			} else {
				throw error;
			}
		}

		noContent(res);
	} catch (error: any) {
		if (error instanceof AppError) {
			return next(error);
		}
		if (error.code === 'auth/user-not-found') {
			return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
		}
		return next(error);
	}
};

export const updateRole = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id } = req.params;
		const validatedData = await validateRequest(updateRoleSchema, req.body);
		const { roleId } = validatedData;

		// Verify user document exists in Firestore first
		const userDoc = await getUserDocument(id);
		if (!userDoc) {
			return next(new AppError(`User with id=${id} not found`, 404, 'USER_NOT_FOUND'));
		}

		// Verify role exists
		const roleDoc = await db.collection('roles').doc(roleId).get();
		if (!roleDoc.exists) {
			return next(new AppError('Role not found', 404, 'ROLE_NOT_FOUND'));
		}

		const roleData = roleDoc.data();
		const roleName = roleData?.name || 'USER';

		// Verify user exists in Firebase Auth
		try {
			await auth.getUser(id);
		} catch (error: any) {
			if (error.code === 'auth/user-not-found') {
				return next(new AppError('User not found in Firebase Auth', 404, 'USER_NOT_FOUND'));
			}
			throw error;
		}

		if (!req.user) {
			return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
		}

		const updatedUser = await updateUserDocument(id, { roleId }, req.user.uid);
		await auth.setCustomUserClaims(id, { role: roleName });

		const role = await populateRole(updatedUser.roleId);

		ok(res, {
			...updatedUser,
			role,
			message: 'User role updated successfully',
		});
	} catch (error: any) {
		if (error instanceof AppError) {
			return next(error);
		}
		if (error.code === 'auth/user-not-found') {
			return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
		}
		return next(error);
	}
};

export const toggleActive = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const { id } = req.params;
		const validatedData = await validateRequest(toggleActiveSchema, req.body);
		const { active } = validatedData;

		// Verify user document exists in Firestore first
		const userDoc = await getUserDocument(id);
		if (!userDoc) {
			return next(new AppError(`User with id=${id} not found`, 404, 'USER_NOT_FOUND'));
		}

		if (!req.user) {
			return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
		}

		// Verify user exists in Firebase Auth before updating
		try {
			await auth.getUser(id);
		} catch (error: any) {
			if (error.code === 'auth/user-not-found') {
				return next(new AppError('User not found in Firebase Auth', 404, 'USER_NOT_FOUND'));
			}
			throw error;
		}

		const updatedUser = await updateUserDocument(id, { active }, req.user.uid);

		// Update Firebase Auth disabled status
		try {
			if (!active) {
				await auth.updateUser(id, { disabled: true });
			} else {
				await auth.updateUser(id, { disabled: false });
			}
		} catch (error: any) {
			if (error.code === 'auth/user-not-found') {
				return next(new AppError('User not found in Firebase Auth', 404, 'USER_NOT_FOUND'));
			}
			throw error;
		}

		const role = await populateRole(updatedUser.roleId);

		ok(res, {
			...updatedUser,
			role,
			message: active ? 'User account activated' : 'User account deactivated',
		});
	} catch (error: any) {
		if (error instanceof AppError) {
			return next(error);
		}
		if (error.code === 'auth/user-not-found') {
			return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
		}
		return next(error);
	}
};
