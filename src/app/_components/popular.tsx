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
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoCart from "@/components/common/video-cart";
import { ContentItem } from "@/components/types/home-page-all-data-type";
import SkeletonWrapper from "@/components/shared/SkeletonWrapper/SkeletonWrapper";
import ErrorContainer from "@/components/shared/ErrorContainer/ErrorContainer";
import NotFound from "@/components/shared/NotFound/NotFound";

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
const Popular = ({
  data,
  isLoading,
  error,
  isError,
}: {
  data: ContentItem[];
  isLoading: boolean;
  error: Error;
  isError: boolean;
}) => {
  const swiperRef = useRef<SwiperCore | null>(null);

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
      <h2 className="text-2xl md:text-4xl lg:text-[60px] font-bold text-white leading-[120%] pt-10 md:pt-14 lg:pt-[80px] pb-6 md:pb-8 lg:pb-10 pl-6 md:pl-8 lg:pl-10">
        Popular
      </h2>
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
              <VideoCart blog={blog} />
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

export default Popular;
