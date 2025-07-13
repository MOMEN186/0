"use client";
import Loading from "@/app/loading";
import parse from "html-react-parser";
import { ROUTES } from "@/constants/routes";
import Container from "@/components/container";
import AnimeCard from "@/components/anime-card";
import { useAnimeStore } from "@/store/anime-store";
import EpisodePlaylist from "@/components/episode-playlist";
import Select, { ISelectOptions } from "@/components/common/select";
import {
  Ban,
  BookmarkCheck,
  CheckCheck,
  Hand,
  TvMinimalPlay,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetAnimeDetails } from "@/query/get-anime-details";
import React, { ReactNode, useEffect, useState } from "react";
import AnimeCarousel from "@/components/anime-carousel";
import { IAnime } from "@/types/anime";
import useFirebaseBookmarks from "@/hooks/use-get-bookmark";
import { toast } from "sonner";
import { useGetAllEpisodes } from "@/query/get-all-episodes";
import Advertisement from "@/components/ads";

type Props = {
  children: ReactNode;
};

const SelectOptions: ISelectOptions[] = [
  { value: "plan to watch", label: "Plan to Watch", icon: BookmarkCheck },
  { value: "watching", label: "Watching", icon: TvMinimalPlay },
  { value: "completed", label: "Completed", icon: CheckCheck },
  { value: "on hold", label: "On Hold", icon: Hand },
  { value: "dropped", label: "Dropped", icon: Ban },
];

const Layout = (props: Props) => {
  const searchParams = useSearchParams();
  const { setAnime, setSelectedEpisode } = useAnimeStore();
  const router = useRouter();

  const currentAnimeId = searchParams?.get("anime") ?? null;
  const episodeId = searchParams?.get("episode") ?? null;
  const [animeId, setAnimeId] = useState<string | null>(currentAnimeId);

  useEffect(() => {
    if (currentAnimeId !== animeId) setAnimeId(currentAnimeId);
    if (episodeId) setSelectedEpisode(episodeId);
  }, [currentAnimeId, episodeId, animeId, setSelectedEpisode]);

  const { data: anime, isLoading } = useGetAnimeDetails(animeId as string);

  useEffect(() => {
    if (anime) setAnime(anime);
  }, [anime, setAnime]);

  useEffect(() => {
    if (!animeId) router.push(ROUTES.HOME);
    //eslint-disable-next-line
  }, [animeId]);

  const { bookmarks, createOrUpdateBookmark } = useFirebaseBookmarks({
    animeId: currentAnimeId as string,
    page: 1,
    per_page: 1,
  });

  const [selected, setSelected] = useState("");

  const handleSelect = async (value: string) => {
    const previousSelected = selected;
    setSelected(value);
    try {
      await createOrUpdateBookmark(
        currentAnimeId as string,
        anime?.anime.info.name!,
        anime?.anime.info.poster!,
        value
      );
    } catch (error) {
      console.log(error);
      setSelected(previousSelected);
      toast.error("Error adding to list", { style: { background: "red" } });
    }
  };

  const { data: episodes, isLoading: episodeLoading } = useGetAllEpisodes(animeId as string);

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen">
      <Container>
        {/* Top Advertisement */}
        <div className="w-full flex justify-center">
          <Advertisement position="top" className="mb-4" />
        </div>

        {/* Video Player */}
        {props.children}

        {/* Bottom Advertisement */}
        <div className="w-full flex justify-center">
          <Advertisement position="bottom" className="my-4" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Left: AnimeCard + Info */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="flex flex-row gap-5">
              {anime?.anime ? (
                <AnimeCard
                  title={anime.anime.info.name || "Unknown Title"}
                  poster={anime.anime.info.poster || "/placeholder-image.jpg"}
                  subTitle={anime.anime.moreInfo.aired || "Unknown Date"}
                  displayDetails={false}
                  className="!h-full !rounded-sm"
                  href={ROUTES.ANIME_DETAILS + "/" + anime.anime.info.id}
                />
              ) : (
                <div className="w-full h-[200px] bg-gray-800 animate-pulse rounded-sm"></div>
              )}

              <div className="flex flex-col gap-6 flex-1">
                <Select
                  placeholder="Add to list"
                  value={bookmarks?.[0]?.status || selected}
                  options={SelectOptions}
                  onChange={handleSelect}
                />
                <h1 className="text-2xl md:font-black font-extrabold z-[100]">
                  {anime?.anime.info.name}
                </h1>
                <p>{parse(anime?.anime.info.description as string)}</p>
              </div>
            </div>
          </div>

          {/* Right: Episode Playlist with z-index */}
          <div className="relative z-10">
            {episodes && (
              <EpisodePlaylist
                animeId={animeId as string}
                title={
                  anime?.anime.info.name || (anime?.anime.moreInfo.japanese as string)
                }
                subOrDub={anime?.anime.info.stats.episodes}
                episodes={episodes}
                isLoading={episodeLoading}
                bookmarks={bookmarks}
              />
            )}
          </div>
        </div>

        {/* Carousels below with separation and lower z-index */}
        <div className="relative z-0 mt-12 pt-6 border-t border-border">
          <AnimeCarousel title="Also Watch" anime={anime?.relatedAnimes as IAnime[]} />
          <AnimeCarousel title="Recommended" anime={anime?.recommendedAnimes as IAnime[]} />
        </div>
      </Container>
    </div>
  );
};

export default Layout;
