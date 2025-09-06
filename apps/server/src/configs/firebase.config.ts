import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const app = admin.initializeApp({
	projectId: process.env.FIREBASE_PROJECT_ID || '',
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
});

const db = admin.firestore();

const storage = admin.storage();
const bucket = storage.bucket();

if (process.env.FIRESTORE_EMULATOR_HOST) {
	console.log(
		`⚡Using Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`,
	);
}

export { admin, db, bucket };
