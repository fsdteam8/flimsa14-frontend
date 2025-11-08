








interface Genre {
  _id: string;
  title: string;
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

export interface Series {
  _id: string;
  title: string;
  genre: Genre[];
  // other properties...
  thumbnailUrl: string;
}

export interface ApiResponse {
  success: boolean;
  movies: Movie[];
  series: Series[];
}
