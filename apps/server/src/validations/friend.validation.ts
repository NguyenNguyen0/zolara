import * as Yup from 'yup';
import { validateRequest } from './auth.validation';

export const sendFriendRequestSchema = Yup.object().shape({
	toUserId: Yup.string().required('Target user ID is required'),
	message: Yup.string().max(300, 'Message cannot exceed 300 characters').optional(),
});

export const handleFriendRequestSchema = Yup.object().shape({
	action: Yup.string()
		.oneOf(['accept', 'reject'], 'Action must be either "accept" or "reject"')
		.required('Action is required'),
});

export const friendSuggestionsSchema = Yup.object().shape({
	limit: Yup.number().min(1).max(50).optional(),
});

export { validateRequest };

