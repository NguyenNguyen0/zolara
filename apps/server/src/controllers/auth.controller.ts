import { NextFunction, Request, Response } from 'express';
import { AppError, AuthRequest } from '../types';
import { ok, created } from '../types/response';
import { signupSchema, loginSchema, refreshTokenSchema, validateRequest } from '../validations/auth.validation';
import { handleFirebaseAuthError } from '../errors/firebase.handler';
import { handleAuthServiceError } from '../errors/auth.handler';
import { signupService, loginService, refreshTokenService, getMeService } from '../services/auth.service';
import { ErrorCode, ErrorMessage } from '../constants/errors';

export const signup = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const validatedData = await validateRequest(signupSchema, req.body) as AuthRequest;
		const { email, password } = validatedData;

		const createdBy = req.user?.uid || 'system';
		const result = await signupService(email, password, createdBy);

		created(
			res,
			result,
			`/api/users/${result.id}`,
		);
	} catch (error: any) {
		if (error instanceof AppError) {
			return next(error);
		}
		if (error.code && error.code.startsWith('auth/')) {
			return next(handleFirebaseAuthError(error));
		}
		return next(handleAuthServiceError(error));
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const validatedData = await validateRequest(loginSchema, req.body) as AuthRequest;
		const { email } = validatedData;

		const result = await loginService(email);

		ok(res, result);
	} catch (error: any) {
		if (error instanceof AppError) {
			return next(error);
		}
		if (error.code && error.code.startsWith('auth/')) {
			return next(handleFirebaseAuthError(error));
		}
		return next(handleAuthServiceError(error));
	}
};

export const refreshToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const validatedData = await validateRequest(refreshTokenSchema, req.body);
		const { uid } = validatedData;

		const result = await refreshTokenService(uid);

		ok(res, result);
	} catch (error: any) {
		if (error instanceof AppError) {
			return next(error);
		}
		if (error.code && error.code.startsWith('auth/')) {
			return next(handleFirebaseAuthError(error));
		}
		return next(handleAuthServiceError(error));
	}
};

export const getMe = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		if (!req.user) {
			return next(new AppError(ErrorMessage.AUTH_REQUIRED, 401, ErrorCode.AUTH_REQUIRED));
		}

		const result = await getMeService(req.user.uid);

		ok(res, result);
	} catch (error: any) {
		return next(handleAuthServiceError(error, { uid: req.user?.uid }));
	}
};
