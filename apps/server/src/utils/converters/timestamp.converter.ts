import { Timestamp } from 'firebase-admin/firestore';

/**
 * Convert Firestore Timestamp to Date
 * Handles various input types for flexibility
 */
export const timestampToDate = (timestamp: any): Date => {
	if (timestamp instanceof Timestamp) {
		return timestamp.toDate();
	}
	if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
		return timestamp.toDate();
	}
	if (timestamp instanceof Date) {
		return timestamp;
	}
	if (typeof timestamp === 'string') {
		return new Date(timestamp);
	}
	return new Date();
};

/**
 * Convert Date to Firestore Timestamp
 * Returns null if date is null/undefined
 */
export const dateToTimestamp = (date: Date | null | undefined): Timestamp | null => {
	if (!date) return null;
	if (date instanceof Date) {
		return Timestamp.fromDate(date);
	}
	return Timestamp.fromDate(new Date(date));
};

