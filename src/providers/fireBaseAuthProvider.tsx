// src/providers/FirebaseAuthProvider.tsx
"use client";

import { useEffect, useState, ReactNode, useContext, createContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useAuthStore } from "@/store/auth-store";
import { initFirebase, FirebaseClients } from "@/lib/firebase/firebase";

export const FirebaseContext = createContext<FirebaseClients | null>(null);
export const useFirebase = () => useContext(FirebaseContext);

export default function FirebaseAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // track Firebase clients
  const [clients, setClients] = useState<FirebaseClients | null>(null);

  useEffect(() => {
    if(typeof window === "undefined") return;
   
    try {
      const nextClients = initFirebase();
      if (!nextClients) return;
      setClients(nextClients);

      const { auth } = nextClients;
      const unsubscribe = onAuthStateChanged(
        auth,
        (user: User | null) => {
          if (user) {
            setAuth({
              id: user.uid,
              email: user.email || "",
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              autoSkip: false,
            });
          } else {
            clearAuth();
          }
        }
      );
      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, [setAuth, clearAuth]);

  // Wait until Firebase client is ready
  if (!clients) {
    return null;
  }

  return (
    <FirebaseContext.Provider value={clients}>
      {children}
    </FirebaseContext.Provider>
  );
}
