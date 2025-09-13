import { initializeApp } from 'firebase/app';
import {
	getAuth,
	signInWithEmailAndPassword,
	connectAuthEmulator,
} from 'firebase/auth';
import readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY || 'demo-key', // Will be ignored when using emulator
	authDomain:
		process.env.FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
	projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
	storageBucket:
		process.env.FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
	messagingSenderId:
		process.env.FIREBASE_MESSAGING_SENDER_ID || '000000000000',
	appId:
		process.env.FIREBASE_APP_ID ||
		'1:000000000000:web:0000000000000000000000',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Connect to Firebase Auth Emulator
const authEmulatorHost =
	process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
connectAuthEmulator(auth, `http://${authEmulatorHost}`, {
	disableWarnings: true,
});
console.log(`⚡ Connected to Firebase Auth emulator at ${authEmulatorHost}`);

// Create readline interface for user input
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function getAuthToken() {
	return new Promise<void>((resolve) => {
		rl.question('Enter email: ', (email) => {
			rl.question('Enter password: ', async (password) => {
				try {
					// Sign in with email and password
					const userCredential = await signInWithEmailAndPassword(
						auth,
						email,
						password,
					);

					// Get the ID token
					const idToken = await userCredential.user.getIdToken();

					console.log('\n--- Authentication Successful ---');
					console.log(`User ID: ${userCredential.user.uid}`);
					console.log(`Email: ${userCredential.user.email}`);
					console.log('\n--- Authentication Token ---');
					console.log(idToken);

					// For easy copying in terminals that support it
					console.log(
						'\nTo use this token in API requests, add it to the Authorization header:',
					);
					console.log('Authorization: Bearer ' + idToken);
				} catch (error: any) {
					console.error('\n❌ Authentication Failed:');
					console.error(error.message || error);
				} finally {
					rl.close();
					resolve();
				}
			});
		});
	});
}

// Execute the function
getAuthToken().catch(console.error);
