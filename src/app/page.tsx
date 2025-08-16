import React from "react";
import Popular from "./_components/popular";
import TopMovie from "./_components/top-movie";
import ComedyClub from "./_components/comedy-club";
import FamilyMovie from "./_components/family-movie";
import Dramas from "./_components/dramas";
import TvShows from "./_components/tv-shows";
import HeroSection from "./_components/hero-section";
import Navbar from "@/components/shared/navbar/Navbar";

const HomePage = () => {
  return (
    <div>
      <div className="relative">
        <div className="sticky top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        
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
