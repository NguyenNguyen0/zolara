import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics conditionally
let analytics: ReturnType<typeof getAnalytics> | null = null;

// Only initialize analytics if supported and not in development mode
if (!import.meta.env.DEV && typeof window !== 'undefined') {
  try {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      } else {
        console.warn('Firebase Analytics is not supported in this environment');
      }
    }).catch((error) => {
      console.warn('Failed to check Analytics support:', error);
    });
  } catch (error) {
    console.warn('Failed to initialize Firebase Analytics:', error);
  }
}

export { analytics };

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });

    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 9098);

    console.log('Connected to Firebase Emulators in development mode');
  } catch (error) {
    console.warn('Firebase Emulator connection failed:', error);
    // App will continue with production Firebase
  }
}

export default app;
