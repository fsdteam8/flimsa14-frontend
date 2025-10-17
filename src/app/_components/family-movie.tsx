"use client";

import React, { useRef } from "react";

// Swiper
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-coverflow";
import "swiper/css/virtual";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper/types";
import MovieCart from "@/components/common/movie-cart";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SkeletonWrapper from "@/components/shared/SkeletonWrapper/SkeletonWrapper";
import ErrorContainer from "@/components/shared/ErrorContainer/ErrorContainer";
import NotFound from "@/components/shared/NotFound/NotFound";
import { GenreWiseMovies } from "@/components/types/home-page-update-data-type";

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

const FamilyMovie = ({
  data,
  isLoading,
  error,
  isError,
}: {
  data: GenreWiseMovies[];
  isLoading: boolean;
  error: Error;
  isError: boolean;
}) => {
  const swiperRef = useRef<SwiperCore | null>(null);
    const movies = data[0]?.movies || [];

  // console.log(data);

  if (isLoading) {
    return (
      <div className="pt-10">
        <SkeletonWrapper count={4} />
      </div>
    );
  } else if (isError) {
    return (
      <div className="pt-10">
        <ErrorContainer message={error?.message || "Something went wrong"} />
      </div>
    );
  } else if (!data || data.length === 0) {
    return (
      <div className="pt-10">
        <NotFound message="Oops! No data available. Modify your filters or check your internet connection." />
      </div>
    );
  }
  return (
    <div className="container">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-[120%] pt-10 md:pt-14 lg:pt-[80px] pb-6 md:pb-8 lg:pb-10 pl-6 md:pl-8 lg:pl-10">
          {data[0]?.genre?.title || "Family Movie"}
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl font-semibold text-[#BFBFBF] leading-[120%] cursor-pointer hover:text-white hover:underline">
          See All
        </p>
      </div>
      <div className="w-full flex items-center relative">
        {data?.length > 4 && (
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
          {movies?.map((blog, index) => (
            <SwiperSlide key={index} className="!h-auto !md:h-full py-4">
              <MovieCart blog={blog} />
            </SwiperSlide>
          ))}
        </Swiper>

        {data?.length > 4 && (
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

export default FamilyMovie;
