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
import { IWatchedAnime } from "@/types";
import { pb } from "@/lib/database";

const VideoPlayerSection = () => {
  const { selectedEpisode, anime } = useAnimeStore();// selected anime and its episode 
  const { data: serversData } = useGetEpisodeServers(selectedEpisode);

  const [serverName, setServerName] = useState<string>("");
  const [key, setKey] = useState<string>("");

  const { auth, setAuth } = useAuthStore();
  const [autoSkip, setAutoSkip] = useState<boolean>(
    auth?.autoSkip || Boolean(localStorage.getItem("autoSkip")) || false,
  );

  useEffect(() => {
    const { serverName, key } = getFallbackServer(serversData);
    setServerName(serverName);
    setKey(key);
  }, [serversData]);

  const { data: episodeData, isLoading } = useGetEpisodeData(
    selectedEpisode,
    serverName,
    key,
  );

  const [watchedDetails, setWatchedDetails] = useState<Array<IWatchedAnime>>(
    JSON.parse(localStorage.getItem("watched") as string) || [],
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
    const res = await pb.collection("users").update(auth.id, {
      autoSkip: value,
    });
    if (res) {
      setAuth({ ...auth, autoSkip: value });
    }
  }

  useEffect(() => {
    if (auth) return;
    if (!Array.isArray(watchedDetails)) {
      localStorage.removeItem("watched");
      return;
    }

    if (episodeData) {
      const existingAnime = watchedDetails.find(
        (watchedAnime) => watchedAnime.anime.id === anime.anime.info.id,
      );

      if (!existingAnime) {
        // Add new anime entry if it doesn't exist
        const updatedWatchedDetails = [
          ...watchedDetails,
          {
            anime: {
              id: anime.anime.info.id,
              title: anime.anime.info.name,
              poster: anime.anime.info.poster,
            },
            episodes: [selectedEpisode],
          },
        ];
        localStorage.setItem("watched", JSON.stringify(updatedWatchedDetails));
        setWatchedDetails(updatedWatchedDetails);
      } else {
        // Update the existing anime entry
        const episodeAlreadyWatched =
          existingAnime.episodes.includes(selectedEpisode);

        if (!episodeAlreadyWatched) {
          // Add the new episode to the list
          const updatedWatchedDetails = watchedDetails.map((watchedAnime) =>
            watchedAnime.anime.id === anime.anime.info.id
              ? {
                  ...watchedAnime,
                  episodes: [...watchedAnime.episodes, selectedEpisode],
                }
              : watchedAnime,
          );

          localStorage.setItem(
            "watched",
            JSON.stringify(updatedWatchedDetails),
          );
          setWatchedDetails(updatedWatchedDetails);
        }
      }
    }
    //eslint-disable-next-line
  }, [episodeData, selectedEpisode, auth]);

  if (isLoading || !episodeData)
    return (
      <div className="h-auto aspect-video lg:max-h-[calc(100vh-150px)] min-h-[20vh] sm:min-h-[30vh] md:min-h-[40vh] lg:min-h-[60vh] w-full animate-pulse bg-slate-700 rounded-md"></div>
    );

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
        key={episodeData?.sources?.[0].url}
        episodeInfo={episodeData}
        serversData={serversData!}
        animeInfo={{
          id: anime.anime.info.id,
          title: anime.anime.info.name,
          image: anime.anime.info.poster,
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
