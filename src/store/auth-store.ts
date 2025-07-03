// src/store/auth-store.ts
import {create} from "zustand";
import { persist } from "zustand/middleware";

// User auth data interface (only user fields)
export interface IAuth {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  autoSkip: boolean;
}

// Zustand store interface (state + actions)
export interface IAuthStore {
  auth: IAuth | null;
  setAuth: (auth: IAuth | null) => void;
  clearAuth: () => void;
  isRefreshing: boolean;
  setIsRefreshing: (val: boolean) => void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      auth: null,
      setAuth: (auth) => set({ auth }),
      clearAuth: () => set({ auth: null }),
      isRefreshing: true,
      setIsRefreshing: (val) => set({ isRefreshing: val }),
    }),
    {
      name: "auth-storage",
      // You can add versioning, storage options here if needed
    }
  )
);
