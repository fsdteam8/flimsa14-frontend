
"use client"
import { useQuery } from '@tanstack/react-query';
import React from 'react'

export interface GenreType {
  _id: string;
  user: string;
  title: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface MovieType {
  _id: string;
  title: string;
  description: string;
  releaseDate: string; // ISO string
  genre: GenreType[];
  language: string;
  duration: number;
  cast: string[];
  directors: string[];
  thumbnailUrl: string;
  trailerUrl: string;
  videoUrl: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GenreWiseMovieType {
  genre: GenreType;
  movies: MovieType[];
}

export interface PaginationType {
  total: number;
  page: number;
  pages: number;
}

export interface MoviesResponseData {
  movies: MovieType[];
  genreWiseMovies: GenreWiseMovieType[];
  pagination: PaginationType;
}

export interface MoviesApiResponse {
  success: boolean;
  message: string;
  data: MoviesResponseData;
}


const GenreContainer = ({id}: {id: string}) => {

    const {data, isLoading, isError, error} = useQuery<MoviesApiResponse>({
        queryKey: ["genre-movies", id],
        queryFn : async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/movies?genre${id}`)
            return res.json()
        }
    })

    console.log(data?.data?.movies)
    if(isLoading) return <div>Loading...</div>
    if(isError) return <div>Error: {error?.message}</div>
  return (
    <div className='container mx-auto text-white'>
      single genre
    </div>
  )
}

export default GenreContainer
