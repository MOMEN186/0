// src/providers/FirebaseAuthProvider.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useAuthStore } from "@/store/auth-store";
import { initFirebase, FirebaseClients } from "@/lib/firebase/firebase";

export default function FirebaseAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // track Firebase clients, typed correctly
  const [clients, setClients] = useState<FirebaseClients>({
    app: null,
    auth: null,
    db: null,
    analytics: null,
  });

  useEffect(() => {
    const next = initFirebase();
    setClients(next);

    if (next.auth) {
      const unsubscribe = onAuthStateChanged(
        next.auth,
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
    }
  }, [setAuth, clearAuth]);

  // don’t render children until auth client is ready
  if (!clients.auth) return null;

  return <>{children}</>;
}
