"use client"

import React, { useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Series } from "@/types/series"

// Swiper core + modules
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/free-mode"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperCore } from "swiper/types"
import {
  Navigation,
  Pagination,
  A11y,
  Keyboard,
  Virtual,
  Autoplay,
} from "swiper/modules"

import SeriesCart from "@/components/common/series-cart"

const breakpoints = {
  0: {
    slidesPerView: 1.1, // show a peek on mobile for nicer UX
    spaceBetween: 16,
  },
  768: {
    slidesPerView: 2,
    spaceBetween: 20,
  },
  1024: {
    slidesPerView: 3,
    spaceBetween: 24,
  },
  1440: {
    slidesPerView: 4,
    spaceBetween: 28,
  },
}

interface Pagination {
  total: number
  page: number
  pages: number
}

interface SeriesResponse {
  success: boolean
  message: string
  data: {
    series: Series[]
    pagination: Pagination
  }
}

const SeriesMovies = () => {
  const {
    data: series = [],
    isLoading,
    isError,
    error,
  } = useQuery<SeriesResponse, Error, Series[]>({
    queryKey: ["all-series-movies"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/series`).then((res) =>
        res.json()
      ),
    select: (res) => res?.data?.series ?? [],
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const slides = useMemo(
    () => series.map((s, idx) => ({ key: s._id ?? `s-${idx}`, value: s })),
    [series]
  )

  const hasManySlides = slides.length > 4

  // Swiper refs & handlers
  const swiperRef = useRef<SwiperCore | null>(null)
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)

  const goPrev = useCallback(() => swiperRef.current?.slidePrev(), [])
  const goNext = useCallback(() => swiperRef.current?.slideNext(), [])

  if (isLoading) {
    return (
      <div className="container px-6 md:px-8 lg:px-10 py-10 text-white/80">
        Loading series…
      </div>
    )
  }
  if (isError) {
    return (
      <div className="container px-6 md:px-8 lg:px-10 py-10 text-red-400">
        Error: {error?.message}
      </div>
    )
  }

  return (
    <div className="container">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-[120%] pt-10 md:pt-14 lg:pt-[80px] pb-6 md:pb-8 lg:pb-10 pl-6 md:pl-8 lg:pl-10">
          Series Movies
        </h2>
        <Link
          href="/series"
          className="text-lg md:text-xl lg:text-2xl font-semibold text-[#BFBFBF] leading-[120%] cursor-pointer hover:text-white hover:underline pr-6 md:pr-8 lg:pr-10"
        >
          See All
        </Link>
      </div>

      <div className="relative w-full">
        {/* Prev / Next – wired to Swiper's Navigation for zero-jank control */}
        {hasManySlides && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between">
            <button
              ref={prevRef}
              onClick={goPrev}
              aria-label="Previous"
              className="pointer-events-auto ml-2 md:ml-3 lg:ml-4 grid place-items-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm shadow-md w-10 h-10 md:w-12 md:h-12"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </button>
            <button
              ref={nextRef}
              onClick={goNext}
              aria-label="Next"
              className="pointer-events-auto mr-2 md:mr-3 lg:mr-4 grid place-items-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm shadow-md w-10 h-10 md:w-12 md:h-12"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </button>
          </div>
        )}

        <Swiper
          modules={[Navigation, Pagination, A11y, Keyboard, Virtual, Autoplay]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          // Hook up navigation elements *before* init to avoid layout thrash
          onBeforeInit={(swiper) => {
            // @ts-ignore – Swiper types don't know about null here
            swiper.params.navigation = {
              ...(swiper.params.navigation as object),
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }
          }}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          pagination={{ clickable: true }}
          // Performance / smoothness
          virtual
          watchSlidesProgress
          keyboard={{ enabled: true, onlyInViewport: true }}
          // Avoid loop-induced DOM duplication & jitter; rewind gives seamless edge wrap
          rewind
          speed={600}
          autoplay={{
            delay: 5000,
            pauseOnMouseEnter: true,
            disableOnInteraction: false,
          }}
          grabCursor
          resistanceRatio={0.85}
          allowTouchMove
          updateOnWindowResize
          resizeObserver
          breakpoints={breakpoints}
          spaceBetween={16}
          slidesPerView={1.1}
          className="w-full h-full px-4 md:px-6 lg:px-8"
        >
          {slides.map((s, index) => (
            <SwiperSlide
              // Using stable IDs prevents React reconciliation jitter
              key={s.key}
              virtualIndex={index}
              className="!h-auto py-4 will-change-transform"
            >
              <SeriesCart blog={s.value} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default SeriesMovies
