import * as Yup from 'yup';
import { validateRequest } from './auth.validation';

export const updateUserSchema = Yup.object().shape({
	firstName: Yup.string(),
	lastName: Yup.string(),
	bio: Yup.string(),
	dob: Yup.string().nullable(),
	gender: Yup.string().oneOf(['male', 'female', 'other', 'prefer_not_to_say']).nullable(),
	avatar: Yup.string().url('Invalid avatar URL').nullable(),
	enable: Yup.boolean(),
	active: Yup.boolean(),
});

export const updateRoleSchema = Yup.object().shape({
	roleId: Yup.string().required('roleId is required'),
});

export const toggleActiveSchema = Yup.object().shape({
	active: Yup.boolean().required('Active status is required'),
});

export { validateRequest };

