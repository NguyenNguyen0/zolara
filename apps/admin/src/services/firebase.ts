import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Connect to emulators in development
if (import.meta.env.NODE_ENV === 'development') {
  const firestoreHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST;
  const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
  const storageHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST;

  // Track if emulators are already connected
  let isFirestoreConnected = false;
  let isAuthConnected = false;
  let isStorageConnected = false;

  if (firestoreHost && !isFirestoreConnected) {
    try {
      const [host, port] = firestoreHost.split(':');
      connectFirestoreEmulator(db, host, parseInt(port));
      isFirestoreConnected = true;
    } catch (error) {
      console.warn('Firestore emulator already connected or failed to connect:', error);
    }
  }

  if (authHost && !isAuthConnected) {
    try {
      const [host, port] = authHost.split(':');
      connectAuthEmulator(auth, `http://${host}:${port}`, { disableWarnings: true });
      isAuthConnected = true;
    } catch (error) {
      console.warn('Auth emulator already connected or failed to connect:', error);
    }
  }

  if (storageHost && !isStorageConnected) {
    try {
      const [host, port] = storageHost.split(':');
      connectStorageEmulator(storage, host, parseInt(port));
      isStorageConnected = true;
    } catch (error) {
      console.warn('Storage emulator already connected or failed to connect:', error);
    }
  }
} else {
	console.log("Run production firebase...");
}

export default app;
