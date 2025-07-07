import { GET_EPISODE_DATA } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { IEpisodeSource } from "@/types/episodes";
import { useQuery } from "react-query";

const getEpisodeData = async (
  episodeId: string,
  server: string | undefined,
  subOrDub: string
) => {
  // console.log(
  //   "getEpisodeData",
  //   { episodeId, server, subOrDub },);
  // console.log("decodeURIComponent(episodeId)", decodeURIComponent(episodeId));
  try {
    const res = await api.get("/api/episode/sources", {
      params: {
        animeEpisodeId: decodeURIComponent(episodeId),
        server: server,
        category: subOrDub,
      },
    });
    // console.log("res.data.data", res.data.data);
    return res.data.data as IEpisodeSource;
  } catch (e) {
    console.log(e);
  }
};

export const useGetEpisodeData = (
  episodeId: string,
  server: string | undefined,
  subOrDub: string = "sub"
) => {
  return useQuery({
    queryFn: () => getEpisodeData(episodeId, server, subOrDub),
    queryKey: [GET_EPISODE_DATA, episodeId, subOrDub],
    refetchOnWindowFocus: false,
    enabled: server !== "",
  });
};
