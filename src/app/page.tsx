import React from "react";
import Popular from "./_components/popular";
import TopMovie from "./_components/top-movie";
import ComedyClub from "./_components/comedy-club";
import FamilyMovie from "./_components/family-movie";
import Dramas from "./_components/dramas";
import TvShows from "./_components/tv-shows";
import HeroSection from "./_components/hero-section";

const HomePage = () => {
  return (
    <div>
      <div className="relative">
        <HeroSection />
        <Popular />
        <TopMovie />
        <ComedyClub />
        <FamilyMovie />
        <Dramas />
        <TvShows />
      </div>
    </div>
  );
};

export default HomePage;
