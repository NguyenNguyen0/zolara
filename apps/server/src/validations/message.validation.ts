import * as Yup from 'yup';
import { validateRequest } from './auth.validation';

export const createMessageSchema = Yup.object().shape({
	conversationId: Yup.string().required('Conversation ID is required'),
	content: Yup.string().when('imgUrl', {
		is: (imgUrl: string) => !imgUrl,
		then: (schema) => schema.required('Content or image is required'),
		otherwise: (schema) => schema.optional(),
	}),
	imgUrl: Yup.string().url('Invalid URL').optional(),
});

export const updateMessageSchema = Yup.object().shape({
	content: Yup.string().optional(),
	imgUrl: Yup.string().url('Invalid URL').optional(),
});

export const getMessagesSchema = Yup.object().shape({
	limit: Yup.number().min(1).max(100).optional(),
	before: Yup.date().optional(),
	after: Yup.date().optional(),
});

export { validateRequest };
