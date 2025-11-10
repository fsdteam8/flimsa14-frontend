
import type { Series as SeriesType } from "@/types/series";

interface Genre {
  _id: string;
  title: string;
  name?: string;
  thumbnail: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}


export interface Movie {
  _id: string;
  title: string;
  description: string;
  cast: string[];
  directors: string[];
  duration: number;
  genre: Genre[];
  isPremium: boolean;
  language: string;
  releaseDate: string;
  thumbnailUrl: string;
  trailerUrl: string;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type Series = SeriesType;

export interface ApiResponse {
  success: boolean;
  movies: Movie[];
  series: Series[];
}
