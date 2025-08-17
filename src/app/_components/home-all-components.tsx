"use client";
import React from "react";
import Popular from "./popular";
import Upcoming from "./upcoming";
import TopMovie from "./top-movie";
import ComedyClub from "./comedy-club";
import FamilyMovie from "./family-movie";
import Dramas from "./dramas";
import TvShows from "./tv-shows";
import { useQuery } from "@tanstack/react-query";
import { HomePageApiResponse } from "@/components/types/home-page-all-data-type";

const HomeAllComponents = () => {
  const { data, isLoading, isError, error } = useQuery<HomePageApiResponse>({
    queryKey: ["home-page-all-data"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/home`).then((res) =>
        res.json()
      ),
  });

  console.log(data?.data?.upcoming);
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  return (
    <div className="">
      <Popular data={data?.data?.popular || []} />
      <Upcoming data={data?.data?.upcoming || []} />
      <TopMovie />
      <ComedyClub />
      <FamilyMovie />
      <Dramas />
      <TvShows />
    </div>
  );
};

export default HomeAllComponents;
