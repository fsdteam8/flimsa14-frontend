"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "./hero-section";
import { MovieApiResponse } from "@/components/types/home-page-update-data-type";
import ComedyClub from "./comedy-club";
import FamilyMovie from "./family-movie";

const HomeAllComponents = () => {
  const { data, isLoading, isError, error } = useQuery<MovieApiResponse>({
    queryKey: ["home-page-all-data"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/movies`).then((res) =>
        res.json()
      ),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  const moviesByGenre = data?.data?.genreWiseMovies || [];
  return (
    <div className="">
      <section className="">
        <HeroSection />
      </section>

      {/* <section>
        {data?.data?.popular && data?.data?.popular.length > 0 && (
          <Popular
            isLoading={isLoading}
            isError={isError}
            error={error ?? new Error("Unknown error")}
            data={data?.data?.popular || []}
          />
        )}
      </section>

      <section>
        {data?.data?.upcoming && data?.data?.upcoming.length > 0 && (
          <Upcoming
            isLoading={isLoading}
            isError={isError}
            error={error ?? new Error("Unknown error")}
            data={data?.data?.upcoming || []}
          />
        )}
      </section>

      <section>
        {data?.data?.weekly_top && data?.data?.weekly_top.length > 0 && (
          <TopMovie
            isLoading={isLoading}
            isError={isError}
            error={error ?? new Error("Unknown error")}
            data={data?.data?.weekly_top || []}
          />
        )}
      </section> */}

      <section>
        {moviesByGenre?.length > 0 && (
          <ComedyClub
            isLoading={isLoading}
            isError={isError}
            error={error ?? new Error("Unknown error")}
            data={moviesByGenre || []}
          />
        )}
      </section>

      <section>
        {moviesByGenre?.length > 0 && (
          <FamilyMovie
            isLoading={isLoading}
            isError={isError}
            error={error ?? new Error("Unknown error")}
            data={moviesByGenre || []}
          />
        )}
      </section>

      {/* <section>
        {data?.data?.documentary && data?.data?.documentary.length > 0 && (
          <Dramas
            isLoading={isLoading}
            isError={isError}
            error={error ?? new Error("Unknown error")}
            data={data?.data?.documentary || []}
          />
        )}
      </section>

      <section>
        {data?.data?.reality_tv && data?.data?.reality_tv.length > 0 && (
          <TvShows
            isLoading={isLoading}
            isError={isError}
            error={error ?? new Error("Unknown error")}
            data={data?.data?.reality_tv || []}
          />
        )}
      </section> */}
    </div>
  );
};

export default HomeAllComponents;
