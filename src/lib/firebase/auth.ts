// lib/auth.ts
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";

// Google Sign‑in
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth!, provider);
};

// Discord Sign‑in
export const signInWithDiscord = async () => {
  // Firebase uses OAuthProvider for generic OAuth flows
  const discordProvider = new OAuthProvider("discord.com");
  // Optional: request additional scopes
  discordProvider.addScope("identify");
  discordProvider.addScope("email");
  return await signInWithPopup(auth!, discordProvider);
};

// Email/Password Sign‑in
export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth!, email, password);
};

// Sign‑out (logout)
export const signOut = async () => {
  await firebaseSignOut(auth!);
};
