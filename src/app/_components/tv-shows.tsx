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
import { ContentItem } from "@/components/types/home-page-all-data-type";

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

const TvShows = ({ data }: { data: ContentItem[] }) => {
  const swiperRef = useRef<SwiperCore | null>(null);

  return (
    <div className="container">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl md:text-4xl lg:text-[60px] font-bold text-white leading-[120%] pt-10 md:pt-14 lg:pt-[80px] pb-6 md:pb-8 lg:pb-10 pl-6 md:pl-8 lg:pl-10">
         {data?.[0]?.genre_name || "TV Shows"}
        </h2>
        <p className="text-xl md:text-2xl lg:text-[32px] font-semibold text-[#BFBFBF] leading-[120%] cursor-pointer hover:text-white hover:underline">
          See All
        </p>
      </div>
      <div className="w-full flex items-center relative">
        {data?.length > 4 && (
          <div className="absolute left-0 z-10">
            <button onClick={() => swiperRef.current?.slideNext()}>
              <ChevronLeft className="w-[40px] md:w-[60px] lg:w-[80px] h-[40px] md:h-[60px] lg:h-[80px] text-white" />
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
          {data?.map((blog, index) => (
            <SwiperSlide key={index} className="!h-auto !md:h-full py-4">
              <MovieCart blog={blog} />
            </SwiperSlide>
          ))}
        </Swiper>

        {data?.length > 4 && (
          <div className="absolute right-0 z-10">
            <button onClick={() => swiperRef.current?.slidePrev()}>
              <ChevronRight className="w-[40px] md:w-[60px] lg:w-[80px] h-[40px] md:h-[60px] lg:h-[80px] text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TvShows;
