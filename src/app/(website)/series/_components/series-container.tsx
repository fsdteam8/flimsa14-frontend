"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import type { Series } from "@/types/series";
import SeriesModal from "@/components/common/series-modal";

interface PaginationMeta {
  total: number;
  page: number;
  pages: number;
}

interface SeriesResponse {
  success: boolean;
  message: string;
  data: {
    series: Series[];
    pagination: PaginationMeta;
  };
}

const getGenreTitle = (genre?: { title?: string; name?: string }) =>
  genre?.title || genre?.name || "Genre";

const SeriesContainer = () => {
  const [activeSeries, setActiveSeries] = useState<Series | null>(null);
  const { data, isLoading, isError, error } = useQuery<SeriesResponse>({
    queryKey: ["all-series-movies"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/series`).then((res) =>
        res.json()
      ),
  });

  const seriesMoviesData = data?.data?.series || [];

  if (isLoading) {
    return <div className="py-12 text-center text-white">Loading...</div>;
  }
  if (isError) {
    return (
      <div className="py-12 text-center text-red-400">
        Error: {error?.message}
      </div>
    );
  }
  return (
    <div className="container mx-auto py-10">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-[120%] pb-4 md:pb-6 lg:pb-8">
        Series
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8 lg:gap-10">
        {seriesMoviesData?.map((series) => (
          <div
            key={series._id}
            className="relative cursor-pointer"
            onClick={() => setActiveSeries(series)}
          >
            <Image
              src={series.thumbnailUrl || "/assets/images/no-img-available.jpg"}
              alt={series.title}
              width={300}
              height={300}
              className="h-[320px] w-full rounded-[10px] object-cover"
            />
            <div className="absolute bottom-3 left-0 right-0 rounded-b-[10px] bg-gradient-to-t from-black/80 via-black/20 to-transparent px-3 py-2">
              <h3 className="text-center text-lg md:text-xl lg:text-2xl font-semibold text-white leading-[120%]">
                {series.title}
              </h3>
              <p className="text-center text-base md:text-lg font-normal text-white/80 leading-[120%]">
                {series.genre?.map((genre) => getGenreTitle(genre)).join(", ")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {activeSeries && (
        <SeriesModal
          series={activeSeries}
          isOpen={Boolean(activeSeries)}
          onClose={() => setActiveSeries(null)}
        />
      )}
    </div>
  );
};

export default SeriesContainer;
