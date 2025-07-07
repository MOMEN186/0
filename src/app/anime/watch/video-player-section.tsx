"use client";

import { useAnimeStore } from "@/store/anime-store";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ArbPlayer from "@/components/arb-player";
import { useGetEpisodeData } from "@/query/get-episode-data";
import { useGetEpisodeServers } from "@/query/get-episode-servers";
import { useAuthStore } from "@/store/auth-store";
import Advertisement from "@/components/ads";
import { getFallbackServer } from "@/utils/video";
import { db } from "@/lib/firebase/firebase";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

const VideoPlayerSection = () => {
  const { selectedEpisode, anime } = useAnimeStore();
  const { data: serversData } = useGetEpisodeServers(selectedEpisode);

  const [serverName, setServerName] = useState<string>("");
  const [key, setKey] = useState<string>("sub");

  const { auth, setAuth } = useAuthStore();
  const [autoSkip, setAutoSkip] = useState<boolean>(
    auth?.autoSkip || Boolean(localStorage.getItem("autoSkip")) || false
  );


  useEffect(() => {
    const { serverName } = getFallbackServer(serversData);
    setServerName(serverName);
  
  }, [serversData]);


  const { data: episodeData, isLoading } = useGetEpisodeData(
    selectedEpisode,
    serverName,
    key
  );


  function changeServer(serverName: string, key: string) {
    setServerName(serverName);
    setKey(key);
    const preference = { serverName, key };
    localStorage.setItem("serverPreference", JSON.stringify(preference));
  }

  async function onHandleAutoSkipChange(value: boolean) {
    setAutoSkip(value);
    if (!auth) {
      localStorage.setItem("autoSkip", JSON.stringify(value));
      return;
    }

    const userRef = doc(db, "users", auth.id);
    await updateDoc(userRef, { autoSkip: value });
    setAuth({ ...auth, autoSkip: value });
  }

  useEffect(() => {    
    if (!auth || !episodeData) return;

    const updateWatchHistory = async () => {
      try {
        const bookmarkQuery = await getDocs(collection(db, "bookmarks"));
        const bookmarks = bookmarkQuery.docs.filter(
          (doc) => doc.data().userID === auth.id && doc.data().animeID === anime.anime.info.id
        );

        let bookmarkRef;
        if (bookmarks.length > 0) {
          bookmarkRef = doc(db, "bookmarks", bookmarks[0].id);
        } else {
          bookmarkRef = doc(collection(db, "bookmarks"));
          await setDoc(bookmarkRef, {
            userID: auth.id,
            animeID: anime.anime.info.id,
            animeTitle: anime.anime.info.name,
            thumbnail: anime.anime.info.poster,
            status: "watching",
            createdAt: new Date().toISOString(),
          });
        }

        const bookmarkData = (await getDoc(bookmarkRef)).data();
        const history = Array.isArray(bookmarkData?.watchHistory)
          ? [...bookmarkData.watchHistory]
          : [];

        const historyEntry = `${selectedEpisode}`;
        if (!history.includes(historyEntry)) {
          history.push(historyEntry);
          await updateDoc(bookmarkRef, { watchHistory: history });
        }
      } catch (error) {
        console.error("Error saving watch history:", error);
      }
    };

    updateWatchHistory();
  }, [episodeData, selectedEpisode, auth]);
  
  
  if (isLoading || !episodeData) {
    return (
      <div className="h-auto aspect-video lg:max-h-[calc(100vh-150px)] min-h-[20vh] sm:min-h-[30vh] md:min-h-[40vh] lg:min-h-[60vh] w-full animate-pulse bg-slate-700 rounded-md"></div>
    );
  }
  return !episodeData?.sources || episodeData.sources.length === 0 ? (
    <div className="min-h-[40vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-[728px] mx-auto">
        <Advertisement position="middle" className="mb-4" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>مصدر الفيديو غير متوفر</AlertTitle>
          <AlertDescription>
            عذراً، الحلقة غير متوفرة حالياً. يرجى المحاولة لاحقاً أو اختيار مصدر آخر.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <ArbPlayer
          src={episodeData.sources[0].url}
          referer={episodeData.headers.Referer}
        posterUrl={anime?.anime?.info?.poster || ""}
        episodeInfo={{
          sub:1,dub:1
}}
        serversData={serversData!}
        animeInfo={{
          id: anime.anime.info.id,
          title: anime.anime.info.name,
          image: anime?.anime?.info?.poster||"",
        }}
        onServerChange={changeServer}
        onAutoSkipChange={onHandleAutoSkipChange}
        autoSkip={autoSkip}
        className="w-full h-auto aspect-video lg:max-h-[calc(100vh-150px)] min-h-[20vh] sm:min-h-[30vh] md:min-h-[40vh] lg:min-h-[60vh]"
      />
    </div>
  );
};

export default VideoPlayerSection;