"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Episode } from "@/types/episodes";
import { useAnimeStore } from "@/store/anime-store";
import { Captions, Mic } from "lucide-react";
import { WatchHistoryEntry } from "@/hooks/use-get-watch-history"; // This is your Firebase-based hook

type Props = {
  className?: string;
  episode: Episode;
  showCard?: boolean;
  animeId: string;
  variant?: "card" | "list";
  subOrDub?: { sub: number; dub: number };
  watchedEpisodes?: WatchHistoryEntry[]; // <--- no `| null`
};

const EpisodeCard = ({
  showCard = false,
  variant = "card",
  watchedEpisodes = [],
  ...props
}: Props) => {
  const { selectedEpisode } = useAnimeStore();

  // Check if this episode was watched (simple comparison)
  const hasWatchedEpisode = watchedEpisodes.some(
    (entry) => entry.episodeId === props.episode.episodeId
  );

  if (showCard && variant === "card") {
    return (
      <div
        className={cn([
          "rounded-xl overflow-hidden relative cursor-pointer",
          "h-[8.625rem] min-w-[8.625rem] max-w-[10.625rem] md:h-[10.75rem] md:max-w-[12.5rem]",
          props.className,
        ])}
      >
        <div className="absolute inset-0 m-auto h-full w-full bg-gradient-to-t from-[#000000a9] to-transparent"></div>
        <div className="absolute bottom-0 flex flex-col gap-1 px-4 pb-3">
          <h5 className="line-clamp-1">{`${props.episode.number}. ${props.episode.title}`}</h5>
        </div>
      </div>
    );
  }

  if (!showCard && variant === "card") {
    return (
      <Link
        href={`${ROUTES.WATCH}?anime=${props.animeId}&episode=${props.episode.episodeId}`}
      >
        <div
          className={cn([
            "h-[5.25rem] rounded-lg cursor-pointer w-full flex items-center justify-center bg-secondary md:text-base text-xs",
            hasWatchedEpisode && "bg-slate-900",
          ])}
        >
          {`Episode ${props.episode.number}`}
        </div>
      </Link>
    );
  }

  // Variant: list
  return (
    <Link
      href={`${ROUTES.WATCH}?anime=${props.animeId}&episode=${props.episode.episodeId}`}
    >
      <div
        className="flex gap-5 items-center w-full relative h-fit rounded-md p-2"
        style={
          selectedEpisode === props.episode.episodeId
            ? { backgroundColor: "#e9376b" }
            : hasWatchedEpisode
              ? { backgroundColor: "#0f172a" }
              : {}
        }
      >
        <h3>{`Episode ${props.episode.number}`}</h3>
        {props.subOrDub && props.episode.number <= props.subOrDub.sub && (
          <Captions className="text-gray-400" />
        )}
        {props.subOrDub && props.episode.number <= props.subOrDub.dub && (
          <Mic className="text-gray-400" />
        )}
      </div>
    </Link>
  );
};

export default EpisodeCard;
