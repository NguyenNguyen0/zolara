import * as Yup from 'yup';
import { AppError } from '../types';

export const signupSchema = Yup.object().shape({
	email: Yup.string()
		.email('Invalid email format')
		.required('Email is required'),
	password: Yup.string()
		.min(6, 'Password must be at least 6 characters')
		.required('Password is required'),
});

export const loginSchema = Yup.object().shape({
	email: Yup.string()
		.email('Invalid email format')
		.required('Email is required'),
	password: Yup.string()
		.required('Password is required'),
});

export const refreshTokenSchema = Yup.object().shape({
	uid: Yup.string().required('User ID is required'),
});

export const validateRequest = async <T>(
	schema: Yup.ObjectSchema<any>,
	data: T,
): Promise<T> => {
	try {
		return await schema.validate(data, { abortEarly: false, stripUnknown: true });
	} catch (error: any) {
		if (error instanceof Yup.ValidationError) {
			const errors = error.inner.map((err: any) => ({
				field: err.path || 'unknown',
				code: err.type || 'validation',
				message: err.message,
			}));

			throw new AppError(
				'Validation failed',
				400,
				'VALIDATION',
				{ errors },
			);
		}
		throw error;
	}
};

