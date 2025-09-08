import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import supertest from 'supertest';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import {
	getAuth,
	connectAuthEmulator,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	deleteUser,
	UserCredential,
} from 'firebase/auth';
import {
	doc,
	getFirestore,
	connectFirestoreEmulator,
	setDoc,
	deleteDoc,
	collection,
	getDocs,
	query,
	where,
} from 'firebase/firestore';
import { userRouter } from '../../routes/user';
import { logger } from './mock-logger'; // Use mock logger for tests
import { admin, db as adminDb } from '../../configs/firebase.config';

// Load environment variables
dotenv.config();

// Emulator host and port constants
const FIRESTORE_EMULATOR_HOST = 'localhost';
const FIRESTORE_EMULATOR_PORT = 8080;
const FIREBASE_AUTH_EMULATOR_HOST = 'localhost';
const FIREBASE_AUTH_EMULATOR_PORT = 9099;

// Set environment variables for tests to use Firebase emulators
process.env.FIRESTORE_EMULATOR_HOST = `${FIRESTORE_EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = `${FIREBASE_AUTH_EMULATOR_HOST}:${FIREBASE_AUTH_EMULATOR_PORT}`;

// Firebase client SDK config for test users
const firebaseConfig = {
	apiKey: 'demo-key',
	authDomain: 'demo-project.firebaseapp.com',
	projectId: 'demo-project',
	storageBucket: 'demo-project.appspot.com',
	messagingSenderId: '000000000000',
	appId: '1:000000000000:web:0000000000000000000000',
};

// Initialize Firebase client SDK
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Connect to Firebase emulators
connectAuthEmulator(
	auth,
	`http://${FIREBASE_AUTH_EMULATOR_HOST}:${FIREBASE_AUTH_EMULATOR_PORT}`,
	{ disableWarnings: true }
);
connectFirestoreEmulator(db, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);

// Type definitions
export interface TestUser {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	credential?: UserCredential;
	token?: string;
	uid?: string;
}

// Create a reusable test app
export function createTestApp() {
	const app = express();
	app.use(express.json());
	app.use(logger({ logHeader: true, logBody: true }));

	// Add error handler middleware
	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		console.error('Express error:', err);
		next(err);
	});

	app.use('/api/users', userRouter);

	// Add global error handler
	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		console.error('Unhandled error in test server:', err);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: err.message,
		});
	});

	return app;
}

// Create a test user with Firebase Authentication
export async function createTestUser(
	userData: Omit<TestUser, 'credential' | 'token' | 'uid'>,
): Promise<TestUser> {
	try {
		// Create the user in Firebase Auth
		const credential = await createUserWithEmailAndPassword(
			auth,
			userData.email,
			userData.password,
		);

		const uid = credential.user.uid;

		// Get the token
		const token = await credential.user.getIdToken();

		// Create user profile in Firestore
		await adminDb.collection('users').doc(uid).set({
			id: uid,
			email: userData.email,
			firstName: userData.firstName,
			lastName: userData.lastName,
			enable: true,
			isOnline: false,
			lastSeen: new Date(),
			createdAt: new Date(),
			role: 'user',
		});

		return {
			...userData,
			credential,
			token,
			uid,
		};
	} catch (error) {
		console.error('Error creating test user:', error);
		throw error;
	}
}

// Sign in as a test user and get a fresh token
export async function signInTestUser(
	email: string,
	password: string,
): Promise<string> {
	const credential = await signInWithEmailAndPassword(auth, email, password);
	return credential.user.getIdToken();
}

// Clean up test users and their data
export async function cleanupTestUser(uid: string): Promise<void> {
	try {
		// Delete Firestore data
		await adminDb.collection('users').doc(uid).delete();

		// Delete friend lists
		const friendListsSnapshot = await adminDb
			.collection('friendLists')
			.where('ownerId', '==', uid)
			.get();

		for (const doc of friendListsSnapshot.docs) {
			await doc.ref.delete();
		}

		// Delete block lists
		const blockListsSnapshot = await adminDb
			.collection('blockLists')
			.where('ownerId', '==', uid)
			.get();

		for (const doc of blockListsSnapshot.docs) {
			await doc.ref.delete();
		}

		// Delete invitations
		const sentInvitationsSnapshot = await adminDb
			.collection('invitations')
			.where('senderId', '==', uid)
			.get();

		for (const doc of sentInvitationsSnapshot.docs) {
			await doc.ref.delete();
		}

		const receivedInvitationsSnapshot = await adminDb
			.collection('invitations')
			.where('receiverId', '==', uid)
			.get();

		for (const doc of receivedInvitationsSnapshot.docs) {
			await doc.ref.delete();
		}
	} catch (error) {
		console.error('Error cleaning up test data:', error);
	}
}

// Helper to clean up all test data
export async function cleanupAllTestData(): Promise<void> {
	try {
		// Find all test users (by email pattern or some other identifier)
		const testUsersSnapshot = await adminDb
			.collection('users')
			.where('email', '>=', 'test')
			.where('email', '<=', 'test\uf8ff')
			.get();

		for (const doc of testUsersSnapshot.docs) {
			const userId = doc.id;
			await cleanupTestUser(userId);

			try {
				// Try to delete the user from Firebase Auth
				await admin.auth().deleteUser(userId);
			} catch (error) {
				console.log(`User ${userId} may have already been deleted`);
			}
		}
	} catch (error) {
		console.error('Error cleaning up all test data:', error);
	}
}

// Create a test server and supertest agent
export function createTestServer() {
	const app = createTestApp();
	const server = app.listen();
	const agent = supertest(app);

	return { app, server, agent };
}

// Close test server
export function closeTestServer(server: Server) {
	return new Promise<void>((resolve) => {
		server.close(() => {
			resolve();
		});
	});
}
