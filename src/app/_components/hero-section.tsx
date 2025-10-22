"use client";

import React, { useRef } from "react";

// Swiper
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-coverflow";
import "swiper/css/virtual";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper/types";
import "swiper/css/pagination";
import { Movie } from "@/components/types/home-page-update-data-type";
import moment from "moment";

const breakpoints = {
  0: {
    slidesPerView: 1,
    spaceBetween: 10,
  },
  768: {
    slidesPerView: 1,
    spaceBetween: 10,
  },
  1024: {
    slidesPerView: 1,
    spaceBetween: 10,
  },
  1440: {
    slidesPerView: 1,
    spaceBetween: 10,
  },
};
const HeroSection = ({ data }: { data: Movie[] }) => {
  const swiperRef = useRef<SwiperCore | null>(null);

  console.log(data);
  return (
    <div className="">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop={true}
        pagination={{
          clickable: true,
        }}
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
        className="w-full h-full custom-swiper"
      >
        {data?.slice(0, 4)?.map((blog, index) => (
          <SwiperSlide key={index} className="!h-auto !md:h-full">
            <div
              style={{ backgroundImage: `url(${blog?.thumbnailUrl})`, backgroundBlendMode: "overlay" }}
              className="bg-[#00000098] bg-cover bg-center bg-no-repeat h-[450px] md:h-[550px] lg:h-[680px] w-full object-cover"
            >
              <div className="container">
                <div className="h-[450px] md:h-[550px] lg:h-[680px]  flex flex-col justify-end items-start pl-4 md:pl-14 lg:pl-20 pb-14 md:pb-16 lg:pb-16 xl:pb-20">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-[120%] pb-3 md:pb-4 lg:pb-5">
                    {blog?.title}
                  </h1>
                  <p className="text-xl md:text-2xl lg:text-[28px] font-semibold text-white leading-[120%]">
                    Cast: {blog?.cast.join(" ")}
                  </p>
                  <p className="text-xl md:text-2xl lg:text-[28px] font-semibold text-white leading-[120%] py-2">
                    Director: {blog?.directors.join(", ")}
                  </p>
                  <p className="text-xl md:text-2xl lg:text-[28px] font-semibold text-white leading-[120%]">
                    Release: {moment(blog?.releaseDate).format("MMMM D, YYYY")}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSection;
