import { initializeApp } from 'firebase/app';
import {
	getAuth,
	connectAuthEmulator,
	signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { admin } from '../../configs/firebase.config';

// Firebase client SDK config for test users
const firebaseConfig = {
	apiKey: 'demo-key',
	authDomain: 'demo-project.firebaseapp.com',
	projectId: 'demo-project',
	storageBucket: 'demo-project.appspot.com',
	messagingSenderId: '000000000000',
	appId: '1:000000000000:web:0000000000000000000000',
};

// Set environment variables for emulators
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Initialize Firebase client SDK
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Connect to Firebase emulators
connectAuthEmulator(auth, `http://localhost:9099`, { disableWarnings: true });
connectFirestoreEmulator(db, 'localhost', 8080);

/**
 * Clean up Firebase Auth users that might exist from previous test runs
 */
export async function cleanupEmulators() {
	try {
		console.log('Cleaning up Firebase emulators...');

		// Try to delete test users if they exist
		try {
			// Try to sign in as test user 1
			await signInWithEmailAndPassword(
				auth,
				'test.user1@example.com',
				'Test123!',
			);
			await admin.auth().deleteUser((auth.currentUser as any).uid);
			console.log('Deleted test user 1');
		} catch (error) {
			console.log('Test user 1 does not exist or already deleted');
		}

		try {
			// Try to sign in as test user 2
			await signInWithEmailAndPassword(
				auth,
				'test.user2@example.com',
				'Test123!',
			);
			await admin.auth().deleteUser((auth.currentUser as any).uid);
			console.log('Deleted test user 2');
		} catch (error) {
			console.log('Test user 2 does not exist or already deleted');
		}

		// Clean up Firestore collections
		await cleanupFirestoreCollection('users');
		await cleanupFirestoreCollection('friendLists');
		await cleanupFirestoreCollection('blockLists');
		await cleanupFirestoreCollection('invitations');

		console.log('Emulator cleanup completed');
	} catch (error) {
		console.error('Error cleaning up emulators:', error);
	}
}

/**
 * Clean up a Firestore collection
 */
async function cleanupFirestoreCollection(collectionName: string) {
	try {
		const snapshot = await admin
			.firestore()
			.collection(collectionName)
			.get();

		const batch = admin.firestore().batch();
		snapshot.docs.forEach((doc) => {
			batch.delete(doc.ref);
		});

		if (snapshot.docs.length > 0) {
			await batch.commit();
			console.log(
				`Deleted ${snapshot.docs.length} documents from ${collectionName}`,
			);
		} else {
			console.log(`No documents to delete in ${collectionName}`);
		}
	} catch (error) {
		console.error(`Error cleaning up ${collectionName}:`, error);
	}
}
