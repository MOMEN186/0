// src/lib/firebase.ts
import {
  initializeApp,
  getApps,
  getApp,
  FirebaseApp,
} from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Analytics, getAnalytics } from "firebase/analytics";

/**
 * Describes the initialized Firebase clients.
 */
export interface FirebaseClients {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  analytics: Analytics;
}

/**
 * Initializes Firebase and returns the clients. Must be called on the client.
 */
export function initFirebase(): FirebaseClients | null {
  if (typeof window === "undefined") {
    return null;
  }

  const {
    NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  } = (window as any).__ENV;

  const config = {
    apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Initialize or reuse existing app
  const app = getApps().length > 0 ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const analytics = getAnalytics(app);

  return { app, auth, db, analytics };
}
