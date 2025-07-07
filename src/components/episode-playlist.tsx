"use client";

import EpisodeCard from "./common/episode-card";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Advertisement from "@/components/ads";

import { useAnimeStore } from "@/store/anime-store";
import { Episode, IEpisodes } from "@/types/episodes";
import Select, { ISelectOptions } from "./common/select";
import { Input } from "./ui/input";
import { BookmarkData } from "@/hooks/use-get-bookmark";

type Props = {
  animeId: string;
  title: string;
  subOrDub?: { sub: number; dub: number };
  episodes: IEpisodes;
  isLoading: boolean;
  bookmarks?: BookmarkData[] | null;
};

const EpisodePlaylist = ({
  animeId,
  title,
  subOrDub,
  episodes,
  isLoading,
  bookmarks,
}: Props) => {
  const searchParams = useSearchParams();

  const episodeId = searchParams?.get("episode") ?? null;
  const isLatestEpisode = searchParams?.get("type") ?? null;

  const { setSelectedEpisode } = useAnimeStore();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const episodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [currentGroup, setCurrentGroup] = useState(
    `1 - ${Math.min(50, episodes?.totalEpisodes!)}`
  );
  const [search, setSearch] = useState("");

  const [start, end] = currentGroup.split(" - ").map(Number);
  const filtered = episodes.episodes.filter((_, index) => {
    return index >= start - 1 && index <= end - 1;
  });

  const [filteredEpisodes, setFilteredEpisodes] =
    React.useState<Episode[]>(filtered);

  useEffect(() => {
    if (
      (!episodeId || !episodeId.includes("ep")) &&
      !!episodes &&
      !!episodes.episodes.length
    ) {
      if (!!isLatestEpisode) {
        setSelectedEpisode(
          episodes.episodes[episodes.episodes.length - 1].episodeId as string
        );
      } else {
        setSelectedEpisode(episodes.episodes[0].episodeId as string);
      }
    }
    //eslint-disable-next-line
  }, [episodes]);

  useEffect(() => {
    if (!episodes || currentGroup === "") return;
    const [start, end] = currentGroup.split(" - ").map(Number);
    const filtered = episodes.episodes.filter((_, index) => {
      return index >= start - 1 && index <= end - 1;
    });

    setFilteredEpisodes(filtered);
  }, [episodes, currentGroup]);

  useEffect(() => {
    const episodeIndex = episodes?.episodes.findIndex(
      (episode) => episode.episodeId === episodeId
    );

    if (
      episodeIndex !== undefined &&
      episodeIndex >= 0 &&
      episodeRefs.current[episodeIndex]
    ) {
      const episodeElement = episodeRefs.current[episodeIndex];
      const scrollContainer = scrollContainerRef.current;

      if (episodeElement && scrollContainer) {
        const episodeOffsetTop = episodeElement.offsetTop;
        scrollContainer.scrollTop =
          episodeOffsetTop -
          scrollContainer.offsetHeight / 2 +
          episodeElement.offsetHeight / 2 +
          80;
      }
    }
    //eslint-disable-next-line
  }, [animeId, episodes]);

  const handleOnSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!episodes) return;
    const value = e.target.value;
    setSearch(value);

    if (!value) {
      const [start, end] = currentGroup.split(" - ").map(Number);
      const filtered = episodes.episodes.filter((_, index) => {
        return index >= start - 1 && index <= end - 1;
      });
      setFilteredEpisodes(filtered);
      return;
    }

    const filtered = episodes?.episodes.filter((episode) =>
      episode.number.toString().toLowerCase().includes(value.toLowerCase())
    );

    setFilteredEpisodes(filtered);
  };

  const handleOnSelectChange = (range: string) => {
    setCurrentGroup(range);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const groupOptions = (): ISelectOptions[] => {
    let start = 1;
    const end = episodes?.totalEpisodes;
    const options: ISelectOptions[] = [];
    while (start <= end!) {
      const range = `${start} - ${Math.min(start + 49, end!)}`;
      options.push({
        label: range,
        value: range,
      });
      start += 50;
    }
    return options;
  };

  return (
    episodes && (
      <div className="col-span-1 flex flex-col w-full gap-5 border-[.0313rem] border-secondary rounded-md overflow-hidden min-h-[20vh] sm:min-h-[30vh] md:min-h-[40vh] lg:min-h-[60vh] max-h-[500px]">
        <div className="h-fit bg-[#18181a] px-5 py-3">
          <h3 className="text-lg font-semibold"> Episode Playlist</h3>
          <span className="text-sm font-thin">{title}</span>
          <div className="flex flex-row w-full items-center justify-between gap-2 mt-2">
            <Input
              placeholder="Search Episode"
              value={search}
              onChange={handleOnSearchChange}
              className="w-1/2"
            />
            <Select
              value={currentGroup}
              placeholder={currentGroup}
              onChange={handleOnSelectChange}
              options={groupOptions()}
              className="w-1/2"
            />
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className={`flex flex-col flex-grow gap-1 px-2 pb-3 overflow-y-auto`}
        >
          {filteredEpisodes &&
            filteredEpisodes.map((episode, idx) => (
              //@ts-expect-error type mismatch
              <div key={idx} ref={(el) => (episodeRefs.current[idx] = el)}>
                <EpisodeCard
                  subOrDub={subOrDub}
                  variant={"list"}
                  episode={episode}
                  animeId={animeId}
                  watchedEpisodes={bookmarks?.[0]?.expand?.watchHistory ?? []}
                />
              </div>
            ))}
          {!filteredEpisodes?.length && !isLoading && "No Episodes"}
          {isLoading && <PlaylistSkeleton />}
        </div>
        <div className="flex flex-col space-y-2">
          {filteredEpisodes.map((episode, index) => (
            <React.Fragment key={episode.episodeId}>
              <EpisodeCard
                episode={episode}
                animeId={animeId}
                subOrDub={subOrDub}
                watchedEpisodes={bookmarks?.[0]?.expand?.watchHistory}
                variant="list"
              />
              {(index + 1) % 20 === 0 && (
                <Advertisement position="middle" className="my-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  );
};

const PlaylistSkeleton = () => {
  return (
    <>
      {[1, 1, 1, 1, 1, 1, 1, 1, 1].map((_, idx) => {
        return (
          <div
            className="flex gap-5 items-center w-full relative !min-h-16 rounded-md  animate-pulse bg-slate-800"
            key={idx}
          ></div>
        );
      })}
    </>
  );
};

export default EpisodePlaylist;
