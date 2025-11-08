import * as Yup from 'yup';
import { validateRequest } from './auth.validation';

export const createRoleSchema = Yup.object().shape({
	name: Yup.string().required('Role name is required'),
	description: Yup.string().required('Description is required'),
	permissionIds: Yup.array().of(Yup.string()).default([]),
	active: Yup.boolean().default(true),
});

export const updateRoleSchema = Yup.object().shape({
	name: Yup.string(),
	description: Yup.string(),
	permissionIds: Yup.array().of(Yup.string()),
	active: Yup.boolean(),
}).test(
	'at-least-one-field',
	'At least one field must be provided',
	function (value) {
		return Object.keys(value).length > 0;
	},
);

export const updateRolePermissionsSchema = Yup.object().shape({
	permissionIds: Yup.array()
		.of(Yup.string())
		.required('Permission IDs are required'),
});

export { validateRequest };

