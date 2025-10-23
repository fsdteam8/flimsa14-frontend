"use client"

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";

export interface Genre {
  _id: string;
  user: string;
  title: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Episode {
  _id: string;
  title: string;
  description: string;
  episodeNumber: number;
  videoUrl: string;
  duration: number;
  thumbnailUrl: string | null;
  releaseDate: string; // ISO date string
}

export interface Season {
  _id: string;
  seasonNumber: number;
  name: string;
  trailerUrl: string;
  thumbnailUrl: string | null;
  episodes: Episode[];
}

export interface Series {
  _id: string;
  title: string;
  description: string;
  genre: Genre[];
  cast: string[]; // Note: some data might come as ["[\"name\"]"] so may need parsing
  trailerUrl: string;
  thumbnailUrl: string | null;
  status: string; // e.g., "ongoing"
  seasons: Season[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
}

export interface SeriesData {
  series: Series[];
  pagination: Pagination;
}

export interface SeriesResponse {
  success: boolean;
  message: string;
  data: SeriesData;
}

const SeriesContainer = () => {
  const { data, isLoading, isError, error } = useQuery<SeriesResponse>({
    queryKey: ["all-series-movies"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/series`).then((res) =>
        res.json()
      ),
  });

  console.log("series data", data?.data?.series);
  const seriesMoviesData = data?.data?.series || [];
  console.log(seriesMoviesData);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }
  return (
     <div className='container mx-auto py-10'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-[120%] pb-4 md:pb-6 lg:pb-8'>Series</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10'>
            {
              seriesMoviesData?.map((series)=>{
                return <div key={series._id} className='relative'>
                  <Image src={series.thumbnailUrl || "/assets/images/no-img-available.jpg"} alt={series.title} width={300} height={300} className='w-full h-[320px] object-cover rounded-[10px]'/>
                 <div className='absolute bottom-3 left-0 right-0'>
                   <h3 className='text-lg md:text-xl lg:text-2xl font-semibold text-white leading-[120%] text-center'>{series.title}</h3>
                  <p className='text-base md:text-lg font-normal text-white leading-[120%] text-center'>{series.genre?.map((genre) => genre.title).join(", ")}</p>
                 </div>
                </div>
              })
            }
          </div>
        </div>
  );
};

export default SeriesContainer;
