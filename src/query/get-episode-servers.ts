import { GET_EPISODE_SERVERS } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { IEpisodeServers } from "@/types/episodes";
import { useQuery } from "react-query";

const getEpisodeServers = async (episodeId: string) => {
  try {

    const res = await api.get("/api/episode/servers", {
      params: {
        animeEpisodeId: episodeId, // Remove decodeURIComponent
      },
    });
    const result = res.data.data as IEpisodeServers;
    return result;
  } catch (e) {
    console.log("getEpisodeServers error", e);
    throw e; // Throw the error instead of returning it
  }
};

export const useGetEpisodeServers = (episodeId: string) => {
  return useQuery({
    queryFn: () => getEpisodeServers(episodeId),
    queryKey: [GET_EPISODE_SERVERS, episodeId],
    refetchOnWindowFocus: false,
    enabled: !!episodeId && episodeId.includes('?ep='), // Only run if episodeId is valid
  });
};