import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import Constants from 'expo-constants';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const env = Constants.expoConfig?.extra || {};

// Firebase configuration
const firebaseConfig = {
	apiKey: env.FIREBASE_API_KEY,
	authDomain: env.FIREBASE_AUTH_DOMAIN,
	projectId: env.FIREBASE_PROJECT_ID,
	storageBucket: env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
	appId: env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export default app;
export const auth = getAuth(app);
export const db = getFirestore(app);

// using emulator if run with development mode
if (__DEV__) {
	try {
		// Detect platform and use appropriate host
		let emulatorHost;

		if (Platform.OS === 'web') {
			// For web platform (Expo web)
			emulatorHost = 'localhost';
		} else if (Platform.OS === 'android') {
			// For Android emulator
			emulatorHost = '10.0.2.2';
		} else if (Platform.OS === 'ios') {
			// For iOS simulator
			emulatorHost = 'localhost';
		} else {
			// Default fallback
			emulatorHost = 'localhost';
		}

		console.log(
			`Connecting to Firebase Emulator on ${Platform.OS} using host: ${emulatorHost}`,
		);

		// Connect to Auth emulator
		connectAuthEmulator(auth, `http://${emulatorHost}:9099`, {
			disableWarnings: true,
		});

		// Connect to Firestore emulator
		connectFirestoreEmulator(db, emulatorHost, 9098);

		console.log('Connected to Firebase Emulator successfully');
	} catch (error) {
		console.warn('Firebase Emulator connection failed:', error);
		// App will continue with production Firebase
	}
}
