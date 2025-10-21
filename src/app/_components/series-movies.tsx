"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useRef } from "react";

// Swiper
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-coverflow";
import "swiper/css/virtual";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SeriesCart from "@/components/common/series-cart";
import Link from "next/link";

const breakpoints = {
  0: {
    slidesPerView: 1,
    spaceBetween: 20,
  },
  768: {
    slidesPerView: 2,
    spaceBetween: 25,
  },
  1024: {
    slidesPerView: 3,
    spaceBetween: 30,
  },
  1440: {
    slidesPerView: 4,
    spaceBetween: 30,
  },
};

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

const SeriesMovies = () => {
  const swiperRef = useRef<SwiperCore | null>(null);
  const { data, isLoading, isError, error } = useQuery<SeriesResponse>({
    queryKey: ["all-series-movies"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/series`).then((res) =>
        res.json()
      ),
  });

  console.log("series data", data?.data?.series);
  const seriesMoviesData = data?.data?.series || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }
  return (
    <div className="container">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-[120%] pt-10 md:pt-14 lg:pt-[80px] pb-6 md:pb-8 lg:pb-10 pl-6 md:pl-8 lg:pl-10">
          Series Movies
        </h2>
        <Link
          href="/series"
          className="text-lg md:text-xl lg:text-2xl font-semibold text-[#BFBFBF] leading-[120%] cursor-pointer hover:text-white hover:underline"
        >
          See All
        </Link>
      </div>
      <div className="w-full flex items-center relative">
        {seriesMoviesData?.length > 4 && (
          <div className="absolute left-0 z-10">
            <button onClick={() => swiperRef.current?.slideNext()}>
              <ChevronLeft className="w-[30px] md:w-[40px] lg:w-[50px] h-[30px] md:h-[40px] lg:h-[50px] text-white" />
            </button>
          </div>
        )}

        <Swiper
          modules={[Autoplay]}
          loop={true}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          autoplay={{
            delay: 3000,
            pauseOnMouseEnter: false,
            disableOnInteraction: false,
            stopOnLastSlide: false,
          }}
          speed={3000}
          allowTouchMove={true}
          breakpoints={breakpoints}
          spaceBetween={12}
          className="w-full h-full"
        >
          {seriesMoviesData?.map((blog, index) => (
            <SwiperSlide key={index} className="!h-auto !md:h-full py-4">
              <SeriesCart blog={blog} />
            </SwiperSlide>
          ))}
        </Swiper>

        {seriesMoviesData?.length > 4 && (
          <div className="absolute right-0 z-10">
            <button onClick={() => swiperRef.current?.slidePrev()}>
              <ChevronRight className="w-[30px] md:w-[40px] lg:w-[50px] h-[30px] md:h-[40px] lg:h-[50px] text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesMovies;
