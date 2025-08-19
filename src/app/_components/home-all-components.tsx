"use client";
import React from "react";
import Popular from "./popular";
import Upcoming from "./upcoming";
import ComedyClub from "./comedy-club";
import FamilyMovie from "./family-movie";
import TopMovie from "./top-movie";
import Dramas from "./dramas";
import TvShows from "./tv-shows";
import { useQuery } from "@tanstack/react-query";
import { HomePageApiResponse } from "@/components/types/home-page-all-data-type";
import HeroSection from "./hero-section";

const HomeAllComponents = () => {
  const { data, isLoading, isError, error } = useQuery<HomePageApiResponse>({
    queryKey: ["home-page-all-data"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/home`).then((res) =>
        res.json()
      ),
  });

  // console.log(data?.data?.upcoming);
  return (
    <div className="">
      <section>
        <HeroSection data={data?.data?.popular || []} />
      </section>

      <section>
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
      </section>

      <section>
        {data?.data?.cooking && data?.data?.cooking.length > 0 && (
          <ComedyClub
            isLoading={isLoading}
            isError={isError}
            error={error ?? new Error("Unknown error")}
            data={data?.data?.cooking || []}
          />
        )}
      </section>

      <section>
        {data?.data?.romance && data?.data?.romance.length > 0 && (
          <FamilyMovie
            isLoading={isLoading}
            isError={isError}
            error={error ?? new Error("Unknown error")}
            data={data?.data?.romance || []}
          />
        )}
      </section>

      <section>
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
      </section>
    </div>
  );
};

export default HomeAllComponents;
