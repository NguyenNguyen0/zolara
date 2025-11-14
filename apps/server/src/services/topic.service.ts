import { db } from '../configs/firebase';
import { TopicDocument, TopicCreateData } from '../types/topic';
import { Timestamp } from 'firebase-admin/firestore';
import { convertFirestoreToTopicDocument } from '../utils/converters';

/**
 * Create a new topic document in Firestore
 */
export const createTopicDocument = async (data: TopicCreateData): Promise<TopicDocument> => {
	const now = new Date();

	const topicDocData: any = {
		text: data.text,
		category: data.category,
		createdAt: Timestamp.fromDate(now),
		createdBy: data.createdBy,
		updatedAt: Timestamp.fromDate(now),
		updatedBy: data.createdBy,
	};

	const docRef = db.collection('topics').doc();
	await docRef.set(topicDocData);

	return convertFirestoreToTopicDocument(docRef.id, topicDocData);
};

/**
 * Create multiple topic documents in Firestore (batch operation)
 */
export const createTopicDocuments = async (topics: TopicCreateData[]): Promise<TopicDocument[]> => {
	const batch = db.batch();
	const now = new Date();
	const topicRefs: { ref: FirebaseFirestore.DocumentReference; data: any }[] = [];

	topics.forEach((data) => {
		const docRef = db.collection('topics').doc();
		const topicDocData = {
			text: data.text,
			category: data.category,
			createdAt: Timestamp.fromDate(now),
			createdBy: data.createdBy,
			updatedAt: Timestamp.fromDate(now),
			updatedBy: data.createdBy,
		};

		batch.set(docRef, topicDocData);
		topicRefs.push({ ref: docRef, data: topicDocData });
	});

	await batch.commit();

	return topicRefs.map(({ ref, data }) =>
		convertFirestoreToTopicDocument(ref.id, data)
	);
};

/**
 * Get all topics from Firestore
 */
export const getAllTopics = async (): Promise<TopicDocument[]> => {
	const topicsSnapshot = await db
		.collection('topics')
		.orderBy('createdAt', 'desc')
		.get();

	return topicsSnapshot.docs.map((doc) => {
		const topicData = doc.data();
		return convertFirestoreToTopicDocument(doc.id, topicData);
	});
};

/**
 * Get topics with limit
 */
export const getTopicsWithLimit = async (limit: number): Promise<TopicDocument[]> => {
	const topicsSnapshot = await db
		.collection('topics')
		.orderBy('createdAt', 'desc')
		.limit(limit)
		.get();

	return topicsSnapshot.docs.map((doc) => {
		const topicData = doc.data();
		return convertFirestoreToTopicDocument(doc.id, topicData);
	});
};

/**
 * Get topics count
 */
export const getTopicsCount = async (): Promise<number> => {
	const countSnapshot = await db.collection('topics').count().get();
	return countSnapshot.data().count;
};

/**
 * Check if topics collection is empty
 */
export const isTopicsCollectionEmpty = async (): Promise<boolean> => {
	const count = await getTopicsCount();
	return count === 0;
};

/**
 * Clear all topics from collection
 */
export const clearAllTopics = async (): Promise<void> => {
	const topicsSnapshot = await db.collection('topics').get();
	const batch = db.batch();

	topicsSnapshot.docs.forEach((doc) => {
		batch.delete(doc.ref);
	});

	await batch.commit();
};
