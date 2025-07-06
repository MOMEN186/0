export interface IAnimeDetails {
  anime: {
    info: {
      id: string;
      anilistId: number | null;
      malId: number | null;
      name: string | null;
      poster: string | null;
      description: string | null;
      stats: {
        rating: string | null;
        quality: string | null;
        episodes: {
          sub: number | null;
          dub: number | null;
        };
        type: string | null;
        duration: string | null;
      };
      promotionalVideos: {
        title: string | undefined;
        source: string | undefined;
        thumbnail: string | undefined;
      }[];
      charactersVoiceActors: any[];
    };
    moreInfo: Record<string, string | string[]>;
  };
  seasons: {
    id: string | null;
    name: string | null;
    title: string | null;
    poster: string | null;
    isCurrent: boolean;
  }[];
  mostPopularAnimes: {
    id: string;
    name: string;
    jname: string;
    poster: string;
    episodes: {
      sub: number | null;
      dub: number | null;
    };
    type: string;
  }[];
  relatedAnimes: {
    id: string;
    name: string;
    jname: string;
    poster: string;
    duration: string;
    type: string;
    rating: string;
    episodes: {
      sub: number | null;
      dub: number | null;
    };
  }[];
  recommendedAnimes: {
    id: string;
    name: string;
    jname: string;
    poster: string;
    duration: string;
    type: string;
    rating?: string;
    episodes: {
      sub: number | null;
      dub: number | null;
    };
  }[];
}

export interface Season {
  id: string;
  name: string;
  title: string;
  poster: string;
  isCurrent: boolean;
}

export interface Anime {
  info: Info;
  moreInfo: MoreInfo;
}

export interface Info {
  id: string;
  anilistId: number;
  malId: number;
  name: string;
  poster: string;
  description: string;
  stats: Stats;
  promotionalVideos: PromotionalVideo[];
  charactersVoiceActors: CharactersVoiceActor[];
}

export interface Stats {
  rating: string;
  quality: string;
  episodes: EpisodeCount; // renamed from Episodes
  type: string;
  duration: string;
}

export interface Episode {
  id: string;
  title?: string;
  sub: number | null;
  dub: number | null;
}

export interface EpisodeCount {
  sub: number;
  dub: number;
}

export interface PromotionalVideo {
  title: string;
  source: string;
  thumbnail: string;
}

export interface CharactersVoiceActor {
  character: Character;
  voiceActor: VoiceActor;
}

export interface Character {
  id: string;
  poster: string;
  name: string;
  cast: string;
}

export interface VoiceActor {
  id: string;
  poster: string;
  name: string;
  cast: string;
}

export interface MoreInfo {
  japanese: string;
  synonyms: string;
  aired: string;
  premiered: string;
  duration: string;
  status: string;
  malscore: string;
  genres: string[];
  studios: string;
  producers: string[];
}

export interface MostPopularAnime {
  id: string;
  name: string;
  jname: string;
  poster: string;
  episodes: EpisodeCount;
  type: string;
}

export interface RelatedAnime {
  id: string;
  name: string;
  jname: string;
  poster: string;
  episodes: Partial<EpisodeCount>;
  type: string;
}

export interface RecommendedAnime {
  id: string;
  name: string;
  jname: string;
  poster: string;
  duration: string;
  type: string;
  rating?: string;
  episodes: Partial<EpisodeCount>;
}
