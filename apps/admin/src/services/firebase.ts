import { initializeApp, getApps, getApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Debug environment variables
console.log('🔍 Environment check:', {
  NODE_ENV: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  VITE_USE_EMULATOR: import.meta.env.VITE_USE_EMULATOR,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

// Firebase configuration with better defaults for emulator
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

console.log('🔧 Firebase Config:', firebaseConfig);

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Check if we should use emulator
const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';
const isDevelopment = import.meta.env.DEV;

console.log('🔧 Emulator Settings:', { useEmulator, isDevelopment });

// Initialize services with emulator configuration
export default app;
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators immediately after initialization
if (isDevelopment && useEmulator) {
  console.log('🔧 Connecting to Firebase Emulators...');

  // Connect to emulators (these functions are safe to call multiple times)
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('✅ Auth Emulator connected at http://localhost:9099');
  } catch (error) {
    console.warn('⚠️ Auth Emulator connection failed:', error);
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Firestore Emulator connected at localhost:8080');
  } catch (error) {
    console.warn('⚠️ Firestore Emulator connection failed:', error);
  }

  console.log('🎛️ Emulator UI: http://localhost:4000');
} else {
  console.log('🌐 Using production Firebase');
}
