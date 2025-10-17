export interface MovieApiResponse {
  success: boolean;
  message: string;
  data: {
    movies: Movie[];
    genreWiseMovies: GenreWiseMovies[];
    pagination: Pagination;
  };
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseDate: string; // ISO date string
  genre: Genre[];
  language: string;
  duration: number;
  cast: string[];
  directors: string[];
  thumbnailUrl: string;
  trailerUrl: string;
  videoUrl: string;
  isPremium: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface Genre {
  _id: string;
  user: string;
  title: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GenreWiseMovies {
  genre: Genre;
  movies: Movie[];
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
}
