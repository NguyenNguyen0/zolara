import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  type User as FirebaseUser,
  type UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string;
}

export class FirebaseAuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // For now, we'll assume all users are admins
      // In a real app, you'd fetch the role from Firestore or custom claims
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Admin User',
        role: 'admin'
      };
    } catch (error: unknown) {
      console.error('Firebase sign in error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error('Firebase sign out error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Create a new admin user (for development/testing)
   */
  static async createAdminUser(email: string, password: string, displayName: string): Promise<AuthUser> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, { displayName });

      return {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'admin'
      };
    } catch (error: unknown) {
      console.error('Firebase create user error:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Admin User',
          role: 'admin'
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Get current user
   */
  static getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Admin User',
      role: 'admin'
    };
  }

  /**
   * Handle Firebase auth errors and convert them to user-friendly messages
   */
  private static handleFirebaseError(error: unknown): Error {
    let message = 'An error occurred during authentication';

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message?: string };

      switch (firebaseError.code) {
        case 'auth/user-not-found':
          message = 'No user found with this email address';
          break;
        case 'auth/wrong-password':
          message = 'Invalid password';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection';
          break;
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid email or password';
          break;
        default:
          message = firebaseError.message || 'Authentication failed';
          break;
      }
    }

    return new Error(message);
  }
}
