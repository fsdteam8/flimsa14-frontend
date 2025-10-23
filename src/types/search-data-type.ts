export interface Movie {
  _id: string;
  title: string;
  description: string;
  cast: string[];
  directors: string[];
  duration: number;
  genre: { _id: string; name: string }[];
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

export interface Series {
  _id: string;
  title: string;
  description: string;
  // add other fields if needed
}

export interface ApiResponse {
  success: boolean;
  movies: Movie[];
  series: Series[];
}
