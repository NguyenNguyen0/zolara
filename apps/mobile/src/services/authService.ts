import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  updateProfile
} from "firebase/auth";
import { auth } from "../config/firebase";
import { User } from "@repo/types";

export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(userCredential.user, {
      displayName: name
    });

    return {
      id: userCredential.user.uid,
      name: name,
      email: userCredential.user.email || '',
    };
  } catch (error: any) {
    throw new Error(error.message || "Registration failed");
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      id: userCredential.user.uid,
      name: userCredential.user.displayName || '',
      email: userCredential.user.email || '',
    };
  } catch (error: any) {
    throw new Error(error.message || "Login failed");
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Logout failed");
  }
};
