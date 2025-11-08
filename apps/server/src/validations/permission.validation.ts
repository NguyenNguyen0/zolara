import * as Yup from 'yup';
import { validateRequest } from './auth.validation';

export const createPermissionSchema = Yup.object().shape({
	apiPath: Yup.string().required('API path is required'),
	method: Yup.string()
		.oneOf(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 'Invalid HTTP method')
		.required('Method is required'),
	module: Yup.string().required('Module is required'),
	name: Yup.string().required('Name is required'),
	active: Yup.boolean().default(true),
});

export const updatePermissionSchema = Yup.object().shape({
	apiPath: Yup.string(),
	method: Yup.string().oneOf(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 'Invalid HTTP method'),
	module: Yup.string(),
	name: Yup.string(),
	active: Yup.boolean(),
}).test(
	'at-least-one-field',
	'At least one field must be provided',
	function (value) {
		return Object.keys(value).length > 0;
	},
);

export { validateRequest };

