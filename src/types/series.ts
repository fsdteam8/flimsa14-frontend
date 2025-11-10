export interface GenreSummary {
  _id: string;
  title?: string;
  name?: string;
  thumbnail?: string;
}

export interface Episode {
  _id: string;
  title: string;
  description: string;
  episodeNumber: number;
  videoUrl: string;
  duration: number;
  thumbnailUrl?: string;
  releaseDate?: string;
}

export interface Season {
  _id: string;
  seasonNumber: number;
  name?: string;
  trailerUrl?: string;
  thumbnailUrl?: string;
  episodes: Episode[];
}

export interface Series {
  _id: string;
  title: string;
  description: string;
  genre: GenreSummary[];
  cast: string[];
  directors?: string[];
  trailerUrl?: string;
  thumbnailUrl?: string;
  status?: string;
  seasons: Season[];
  createdAt?: string;
  updatedAt?: string;
}
