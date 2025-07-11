import { useState, useEffect } from "react";
import { useFirebase } from "@/providers/fireBaseAuthProvider";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { useAuthStore } from "@/store/auth-store";

export interface WatchHistoryEntry {
  id: string;
  episodeId: string;
  episodeNumber: number;
  current: number;
  timestamp: number;
  created: Timestamp | string;
}

export function useWatchHistory() {
  const { db } = useFirebase()!;
  const [watchHistory, setWatchHistory] = useState<WatchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuthStore();

  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (!auth?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const bookmarksQuery = query(
          collection(db, "bookmarks"),
          where("userId", "==", auth.id)
        );
        const bookmarksSnapshot = await getDocs(bookmarksQuery);

        const watchHistoryIds: string[] = [];
        bookmarksSnapshot.forEach((doc) => {
          const data = doc.data();
          if (Array.isArray(data.watchHistory)) {
            watchHistoryIds.push(...data.watchHistory);
          }
        });

        if (watchHistoryIds.length === 0) {
          setWatchHistory([]);
          setIsLoading(false);
          return;
        }

        const batchSize = 10;
        const allWatchHistory: WatchHistoryEntry[] = [];

        for (let i = 0; i < watchHistoryIds.length; i += batchSize) {
          const batch = watchHistoryIds.slice(i, i + batchSize);
          const watchHistoryQuery = query(
            collection(db, "watchHistory"),
            where("__name__", "in", batch)
          );

          const watchHistorySnapshot = await getDocs(watchHistoryQuery);
          watchHistorySnapshot.forEach((doc) => {
            allWatchHistory.push({
              id: doc.id,
              ...doc.data(),
            } as WatchHistoryEntry);
          });
        }

        allWatchHistory.sort((a, b) => {
          const dateA = typeof a.created === "string" ? new Date(a.created) : a.created.toDate();
          const dateB = typeof b.created === "string" ? new Date(b.created) : b.created.toDate();
          return dateB.getTime() - dateA.getTime();
        });

        setWatchHistory(allWatchHistory);
      } catch (err) {
        console.error("Error fetching watch history:", err);
        setError("Failed to load watch history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchHistory();
  }, [auth?.id]);

  return { watchHistory, isLoading, error };
}
