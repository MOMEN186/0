// src/providers/FirebaseAuthProvider.tsx
"use client";

import { useEffect } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { useAuthStore } from "@/store/auth-store";

export default function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
    });

    return () => unsubscribe();
  }, [setAuth, clearAuth]);

  return <>{children}</>;
}
