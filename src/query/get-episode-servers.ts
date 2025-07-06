import { GET_EPISODE_SERVERS } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { IEpisodeServers } from "@/types/episodes";
import { useQuery } from "react-query";

const getEpisodeServers = async (episodeId: string) => {
  if (!episodeId) {
    throw new Error("Episode ID is required");
  }

  try {
    // Don't decode the episodeId if it's already properly formatted
    // The episodeId should be in format: "anime-id?ep=episode-number"
    const res = await api.get("/api/episode/servers", {
      params: {
        animeEpisodeId: episodeId, // Remove decodeURIComponent
      },
    });
    
    const result = res.data.data as IEpisodeServers;
    console.log("getEpisodeServers result:", result);
    
    if (!result || !result.sub || !Array.isArray(result.sub)) {
      throw new Error("Invalid server data received");
    }
    
    return result;
  } catch (e) {
    console.error("getEpisodeServers error:", e);
    throw e; // Throw the error instead of returning it
  }
};

export const useGetEpisodeServers = (episodeId: string) => {
  return useQuery({
    queryFn: () => getEpisodeServers(episodeId),
    queryKey: [GET_EPISODE_SERVERS, episodeId],
    refetchOnWindowFocus: false,
    enabled: !!episodeId && episodeId.includes('?ep='), // Only run if episodeId is valid
    retry: 2,
    retryDelay: 1000,
  });
};