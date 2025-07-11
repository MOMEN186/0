// src/lib/firebase.ts
import {
  initializeApp,
  getApps,
  getApp,
  FirebaseApp
} from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Analytics, getAnalytics } from "firebase/analytics";

export interface FirebaseClients {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  analytics: Analytics | null;
}

export function initFirebase(): FirebaseClients {
  if (typeof window === "undefined") {
    // don’t initialize on server
    return { app: null, auth: null, db: null, analytics: null };
  }

  const {
    NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  } = (window as any).__ENV;  // populated by <PublicEnvScript/>

  const config = {
    apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const analytics = getAnalytics(app);

  return { app, auth, db, analytics };
}
