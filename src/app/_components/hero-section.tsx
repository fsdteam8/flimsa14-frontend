



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

export interface movieDataType {
  id: number;
  title: string;
  img: string;
  cast: string;
  director: string;
  rleaseDate: string;
}

const cartData: movieDataType[] = [
  {
    id: 1,
    title: "Gangubai kathiawadi",
    img: "/assets/images/hero1.png",
    cast: "Alia Bhatt",
    director: "Sanjay Leela Bhansali",
    rleaseDate: "25 February 2026",
  },
  {
    id: 2,
    title: "Movie 2",
    img: "/assets/images/hero1.png",
    cast: "Cast of Movie 2",
    director: "Director of Movie 2",
    rleaseDate: "25 May 2026",
  },
  {
    id: 3,
    title: "Movie 3",
    img: "/assets/images/hero1.png",
    cast: "Cast of Movie 3",
    director: "Director of Movie 3",
    rleaseDate: "25 Merge 2026",
  },
];
const HeroSection = () => {
  const swiperRef = useRef<SwiperCore | null>(null);

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
        {cartData?.map((blog, index) => (
          <SwiperSlide key={index} className="!h-auto !md:h-full">
            <div
              style={{ backgroundImage: `url(${blog?.img})` }}
              className="bg-cover bg-center bg-no-repeat h-[450px] md:h-[550px] lg:h-[680px] w-full object-cover"
            >
              <div className="container">
                <div className="h-[450px] md:h-[550px] lg:h-[680px]  flex flex-col justify-end items-start pl-4 md:pl-14 lg:pl-20 pb-14 md:pb-16 lg:pb-16 xl:pb-20">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-[120%] pb-3 md:pb-4 lg:pb-5">
                    {blog?.title}
                  </h1>
                  <p className="text-xl md:text-2xl lg:text-[28px] font-semibold text-white leading-[120%]">
                    Cast: {blog?.cast}
                  </p>
                  <p className="text-xl md:text-2xl lg:text-[28px] font-semibold text-white leading-[120%] py-2">
                    Director: {blog?.director}
                  </p>
                  <p className="text-xl md:text-2xl lg:text-[28px] font-semibold text-white leading-[120%]">
                    Rlease: {blog?.rleaseDate}
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
