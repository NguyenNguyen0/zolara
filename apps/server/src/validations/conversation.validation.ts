import * as Yup from 'yup';
import { validateRequest } from './auth.validation';
import { ConversationType } from '../types/conversation';

export const createConversationSchema = Yup.object().shape({
	type: Yup.string()
		.oneOf(Object.values(ConversationType), 'Invalid conversation type')
		.required('Conversation type is required'),
	participantIds: Yup.array()
		.of(Yup.string().required())
		.min(2, 'At least 2 participants required')
		.required('Participants are required'),
	groupName: Yup.string().when('type', {
		is: ConversationType.GROUP,
		then: (schema) => schema.required('Group name is required for group conversations'),
		otherwise: (schema) => schema.optional(),
	}),
	groupAvatarUrl: Yup.string().url('Invalid URL').optional(),
});

export const updateConversationSchema = Yup.object().shape({
	groupName: Yup.string().optional(),
	groupAvatarUrl: Yup.string().url('Invalid URL').optional(),
});

export const addParticipantSchema = Yup.object().shape({
	userId: Yup.string().required('User ID is required'),
});

export { validateRequest };
