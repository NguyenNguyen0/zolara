import * as Yup from 'yup';
import { validateRequest } from './auth.validation';

export const updateUserSchema = Yup.object().shape({
	firstName: Yup.string(),
	lastName: Yup.string(),
	bio: Yup.string(),
	dob: Yup.date().nullable(),
	gender: Yup.string().oneOf(['male', 'female', 'other', 'prefer_not_to_say']).nullable(),
	avatar: Yup.string().url('Invalid avatar URL').nullable(),
	isLocked: Yup.boolean(),
});

export const updateRoleSchema = Yup.object().shape({
	roleId: Yup.string().required('roleId is required'),
});

export const toggleLockSchema = Yup.object().shape({
	isLocked: Yup.boolean().required('Locked status is required'),
});

export { validateRequest };

