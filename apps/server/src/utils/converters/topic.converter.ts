import { TopicDocument } from '../../types/topic';
import { timestampToDate } from './timestamp.converter';

/**
 * Convert Firestore document to TopicDocument
 */
export const convertFirestoreToTopicDocument = (id: string, data: any): TopicDocument => {
	return {
		id,
		text: data.text || '',
		category: data.category || '',
		createdAt: timestampToDate(data.createdAt),
		createdBy: data.createdBy || '',
		updatedAt: timestampToDate(data.updatedAt),
		updatedBy: data.updatedBy || '',
	};
};
