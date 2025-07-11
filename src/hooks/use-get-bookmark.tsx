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
import { useFirebase } from "@/providers/fireBaseAuthProvider";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export interface BookmarkData {
  id: string;
  userID: string;
  animeId: string;
  animeTitle: string;
  thumbnail: string;
  status: string;
  createdAt: any;
  updatedAt?: any;
  expand?: {
    watchHistory?: any[];
  };
}

interface BookmarkHookParams {
  status?: string;
  page?: number;
  per_page?: number;
  animeId?: string;
}

function useFirebaseBookmarks(params?: BookmarkHookParams | string) {
  const {db}=useFirebase()!;
  
  const { auth } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isLegacyCall = typeof params === "string";
  const animeID = isLegacyCall ? params : params?.animeId;
  const status = isLegacyCall ? undefined : params?.status;
  const page = isLegacyCall ? 1 : params?.page || 1;
  const per_page = isLegacyCall ? 50 : params?.per_page || 10;

  useEffect(() => {
    if (!auth?.id) {
      setBookmarks([]);
      setTotalPages(1);
      setTotalCount(0);
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const bookmarksRef = collection(db, "bookmarks");

        let baseQuery = query(bookmarksRef, where("userID", "==", auth.id));
        if (animeID) baseQuery = query(baseQuery, where("animeID", "==", animeID));
        if (status) baseQuery = query(baseQuery, where("status", "==", status));

        const countSnapshot = await getCountFromServer(baseQuery);
        const total = countSnapshot.data().count;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / per_page));

        let bookmarkDocs;
        if (page > 1) {
          const offset = (page - 1) * per_page;
          const allDocsQuery = query(baseQuery, orderBy("createdAt", "desc"), limit(offset + per_page));
          const allSnapshot = await getDocs(allDocsQuery);
          bookmarkDocs = allSnapshot.docs.slice(offset);
        } else {
          const paginatedQuery = query(baseQuery, orderBy("createdAt", "desc"), limit(per_page));
          const snapshot = await getDocs(paginatedQuery);
          bookmarkDocs = snapshot.docs;
        }

        const rawBookmarks = bookmarkDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as BookmarkData));
        
        const bookmarksWithHistory = await Promise.all(
          rawBookmarks.map(async (bookmark) => {
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
                expand: { watchHistory },
              };
            } catch (error) {
              console.error("Error fetching watch history:", bookmark.id, error);
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
  }, [auth?.id, animeID, status, page, per_page]);

  const createOrUpdateBookmark = async (
    animeId: string,
    animeTitle: string,
    thumbnail: string,
    newStatus: string
  ): Promise<string | null> => {
    if (!auth?.id) return null;

    try {
      const bookmarksRef = collection(db, "bookmarks");
      const q = query(bookmarksRef, where("userID", "==", auth.id), where("animeID", "==", animeId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const existing = snapshot.docs[0].data();
        if (existing.status !== newStatus) {
          await updateDoc(docRef, {
            status: newStatus,
            updatedAt: serverTimestamp(),
          });
        }
        console.log(snapshot.docs[0]);
        return snapshot.docs[0].id;
      } else {
        const docRef = await addDoc(bookmarksRef, {
          userID: auth.id,
          animeId,
          animeTitle,
          thumbnail,
          status: newStatus,
          createdAt: serverTimestamp(),
        });
        return docRef.id;
      }
    } catch (error) {
      console.error("Error creating/updating bookmarks:", error);
      toast.error("Failed to update bookmarks");
      return null;
    }
  };

  const syncWatchProgress = async (
    bookmarkId: string | null,
    watchId: string | null,
    {
      episodeId,
      episodeNumber,
      current,
      duration,
    }: { episodeId: string; episodeNumber: number; current: number; duration: number }
  ): Promise<string | null> => {
    if (!auth?.id || !bookmarkId) return null;

    try {
      const watchHistoryRef = collection(db, "watchHistory");
      if (!watchId) {
        const docRef = await addDoc(watchHistoryRef, {
          bookmarkId,
          episodeId,
          episodeNumber,
          current,
          duration,
          createdAt: serverTimestamp(),
        });
        return docRef.id;
      } else {
        const existingQuery = query(watchHistoryRef, where("bookmarkId", "==", bookmarkId), where("episodeId", "==", episodeId));
        const snapshot = await getDocs(existingQuery);
        if (!snapshot.empty) {
          const docRef = snapshot.docs[0].ref;
          await updateDoc(docRef, {
            current,
            duration,
            updatedAt: serverTimestamp(),
          });
          return snapshot.docs[0].id;
        }
      }
    } catch (error) {
      console.error("Error syncing watch progress:", error);
    }

    return null;
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
