import { GET_EPISODE_SERVERS } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { IEpisodeServers } from "@/types/episodes";
import { useQuery } from "react-query";

const getEpisodeServers = async (episodeId: string) => {
  const res = await api.get("/api/episode/servers", {
    params: {
      animeEpisodeId: decodeURIComponent(episodeId),
    },
  });
  const result = (await res.data.data) as IEpisodeServers;
  console.log("getEpisodeServers", result);
  return result;
};

export const useGetEpisodeServers = (episodeId: string) => {
  return useQuery({
    queryFn: () => getEpisodeServers(episodeId),
    queryKey: [GET_EPISODE_SERVERS, episodeId],
    refetchOnWindowFocus: false,
  });
};
