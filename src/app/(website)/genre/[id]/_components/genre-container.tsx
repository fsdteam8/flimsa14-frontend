"use client";
import ViewDetails from "@/app/_components/view-details";
import FilmsaPagination from "@/components/ui/FilmsaPagination";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

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

const GenreContainer = ({ id }: { id: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, isLoading, isError, error } = useQuery<MoviesApiResponse>({
    queryKey: ["genre-movies", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/movies?genre=${id}&page=${currentPage}&limit=8`
      );
      return res.json();
    },
  });

  console.log(data?.data);
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  return (
    <div className="container mx-auto py-6 md:py-8 lg:py-10 xl:py-12">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-[120%] text-center pb-4 md:pb-6 lg:pb-8">
        {data?.data?.genreWiseMovies[0]?.genre?.title || "Genre Not Available"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {data?.data?.movies?.map((movie, index) => {
          return (
            <div
              key={index}
              onClick={() => {
                setIsOpen(true);
                setSelectedVideoId(movie?._id || null);
              }}
              className="relative"
            >
              <div
                style={{ backgroundImage: `url(${movie?.thumbnailUrl})` }}
                className="bg-cover bg-center bg-no-repeat h-[350px] w-full object-cover rounded-[14px] cursor-pointer"
              ></div>
              <div className="absolute bottom-3 right-0 left-0">
                <h5 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-white text-center ">
                  {movie?.title}
                </h5>
                <p className="text-base md:text-lg font-medium leading-[120%] text-white text-center pt-1">
                  {movie?.genre[0]?.title || "Genre Not Available"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* pagination  */}
      {data &&
        data?.data &&
        data?.data?.pagination &&
        data?.data?.pagination?.pages > 1 && (
          <div className="bg-transparent flex items-center justify-between py-[10px] md:py-[15px] lg:py-[20px] px-4">
            <p className="text-base md:text-lg font-medium leading-[120%]  text-white">
              Showing {currentPage} of{" "}
              {data &&
                data?.data &&
                data?.data?.pagination &&
                data?.data?.pagination?.pages}{" "}
              results
            </p>

            <div>
              <FilmsaPagination
                totalPages={
                  data &&
                  data?.data &&
                  data?.data?.pagination &&
                  data?.data?.pagination?.pages
                }
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        )}
      {/* modal open  */}
      {isOpen && (
        <div>
          <ViewDetails
            open={isOpen}
            onOpenChange={() => setIsOpen(false)}
            videoId={selectedVideoId}
          />
        </div>
      )}
    </div>
  );
};

export default GenreContainer;
