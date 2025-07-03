import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

interface BookmarkHookParams {
  status?: string;
  page?: number;
  per_page?: number;
  animeId?: string;
}

interface BookmarkData {
  id: string;
  userID: string;
  animeId: string;
  animeTitle: string;
  thumbnail: string;
  status: string;
  createdAt: any;
  updatedAt?: any;
  watchHistory?: any[];
  expand?: {
    watchHistory?: any[];
  };
}

function useFirebaseBookmarks(params?: BookmarkHookParams | string) {
  const { auth } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isLegacyCall = typeof params === "string";
  const animeID = isLegacyCall ? params : undefined;
  const status = isLegacyCall ? undefined : params?.status;
  const page = isLegacyCall ? 1 : params?.page || 1;
  const per_page = isLegacyCall ? 50 : params?.per_page || 10;

  useEffect(() => {
    if (!auth) {
      setBookmarks([]);
      setTotalPages(1);
      setTotalCount(0);
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const bookmarksRef = collection(db, "bookmark"); // ✅ Corrected

        let baseQuery = query(bookmarksRef, where("userID", "==", auth.id)); // ✅ Corrected

        if (animeID) {
          baseQuery = query(baseQuery, where("animeID", "==", animeID));
        }

        if (status) {
          baseQuery = query(baseQuery, where("status", "==", status));
        }

        const countSnapshot = await getCountFromServer(baseQuery);
        const total = countSnapshot.data().count;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / per_page));

        const paginatedQuery = query(
          baseQuery,
          orderBy("createdAt", "desc"),
          limit(per_page)
        );

        if (page > 1) {
          const offset = (page - 1) * per_page;
          const allDocsQuery = query(
            baseQuery,
            orderBy("createdAt", "desc"),
            limit(offset + per_page)
          );
          const allSnapshot = await getDocs(allDocsQuery);
          const docsToReturn = allSnapshot.docs.slice(offset);

          const items = docsToReturn.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as BookmarkData)
          );
          setBookmarks(items);
        } else {
          const snapshot = await getDocs(paginatedQuery);
          const items = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as BookmarkData)
          );
          setBookmarks(items);
        }

        const bookmarksWithHistory = await Promise.all(
          bookmarks.map(async (bookmark) => {
            try {
              const watchHistoryQuery = query(
                collection(db, "watchHistory"),
                where("bookmarkId", "==", bookmark.id),
                orderBy("episodeNumber", "desc")
              );
              const historySnapshot = await getDocs(watchHistoryQuery);
              const watchHistory = historySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              return {
                ...bookmark,
                expand: {
                  watchHistory,
                },
              };
            } catch (error) {
              console.error(
                "Error fetching watch history for bookmark:",
                bookmark.id,
                error
              );
              return bookmark;
            }
          })
        );

        setBookmarks(bookmarksWithHistory);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        toast.error("Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [auth, animeID, status, page, per_page]);

  const createOrUpdateBookmark = async (
    animeId: string,
    animeTitle: string,
    thumbnail: string,
    newStatus: string
  ) => {
    if (!auth) return;

    try {
      const bookmarksRef = collection(db, "bookmark"); // ✅ Corrected
      const q = query(
        bookmarksRef,
        where("userID", "==", auth.id), // ✅ Corrected
        where("animeID", "==", animeId)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const existing = snapshot.docs[0].data();

        if (existing.status === newStatus) {
          toast.error("Already in this status");
          return;
        }

        await updateDoc(docRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
        toast.success("Bookmark status updated");
      } else {
        await addDoc(bookmarksRef, {
          userID: auth.id, // ✅ Corrected
          animeId,
          animeTitle,
          thumbnail,
          status: newStatus,
          createdAt: serverTimestamp(),
        });
        toast.success("Bookmark added");
      }
    } catch (error) {
      console.error("Error creating/updating bookmark:", error);
      toast.error("Failed to update bookmark");
    }
  };

  const syncWatchProgress = async (
    bookmarkId: string,
    episodeId: string,
    episodeNumber: number,
    current: number,
    duration: number
  ) => {
    if (!auth || !bookmarkId) return;

    try {
      const watchHistoryRef = collection(db, "watchHistory");
      await addDoc(watchHistoryRef, {
        bookmarkId,
        episodeId,
        episodeNumber,
        current,
        duration,
        createdAt: serverTimestamp(),
      });
      toast.success("Watch progress saved");
    } catch (error) {
      console.error("Error syncing watch progress:", error);
      toast.error("Failed to save watch progress");
    }
  };

  return {
    bookmarks,
    loading,
    isLoading: loading,
    totalPages,
    totalCount,
    createOrUpdateBookmark,
    syncWatchProgress,
  };
}

export default useFirebaseBookmarks;
