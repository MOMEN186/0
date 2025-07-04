"use client";

import React from "react";
import { CirclePlay } from "lucide-react";
import { ROUTES } from "@/constants/routes";

import { usePathname } from "next/navigation";
import { ButtonLink } from "./common/button-link";
import { useWatchHistory } from "@/hooks/use-get-watch-history";

import { useGetLastEpisodeWatched } from "@/hooks/use-get-last-episode-watched";

const WatchButton = () => {
  const pathName = usePathname() ?? "";  
const animeId = pathName.split("/")[2] || "";
  const { watchHistory } = useWatchHistory();
  const latestEpisodeWatched = useGetLastEpisodeWatched(animeId);
  const hasWatchedAnime = watchHistory.some(
    (episode) => episode.id === animeId
  );


  return (
    <ButtonLink
      href={
        !hasWatchedAnime
          ? `${ROUTES.WATCH}?anime=${animeId}`
          : `${ROUTES.WATCH}?anime=${animeId}&episode=${latestEpisodeWatched}`
      }
      className="max-w-fit text-base"
      LeftIcon={CirclePlay}
    >
      {hasWatchedAnime ? "Continue Watching" : "Start Watching"}
    </ButtonLink>
  );
};

export default WatchButton;
