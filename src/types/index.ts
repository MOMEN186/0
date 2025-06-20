export interface IWatchedAnime {
  anime: {
    id: string;
    title: string;
    poster: string;
  };
  episodes: string[];
}

export interface IEpisodeSource {
  sources: Array<{
    url: string;
    isM3U8: boolean;
    quality: string;
  }>;

  subtitles?: Array<{
    url: string;
    language: string;
  }>;

  intro?: {
    start: number;
    end: number;
  };

  outro?: {
    start: number;
    end: number;
  };
}

export interface IEpisodeServers {
  name: string;
  data: string;
}

export interface Info {
  id: string;
  name: string;
  image: string;
  poster: string;
}

export interface ArtPlayerProps {
  key: string;
  episodeInfo: IEpisodeSource;
  serversData: IEpisodeServers[];
  animeInfo: {
    id: string;
    title: string;
    image: string;
  };
  onServerChange: (serverName: string, key: string) => void;
  onAutoSkipChange: (value: boolean) => Promise<void>;
  autoSkip: boolean;
  className?: string;
}
