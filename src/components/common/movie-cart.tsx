"use client";
import React, { useState } from "react";
import ViewDetails from "@/app/_components/view-details";
import { Movie } from "../types/home-page-update-data-type";

const MovieCart = ({ blog }: { blog: Movie  }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  console.log(blog)


  return (
    <div>
      <div
        onClick={() => {
          setIsOpen(true);
          setSelectedVideoId(blog?._id || null);
        }}
        className="relative"
      >
        <div
          style={{ backgroundImage: `url(${blog?.thumbnailUrl})` }}
          className="bg-cover bg-center bg-no-repeat h-[350px] w-full object-cover rounded-[14px] cursor-pointer"
        ></div>
        <div className="absolute bottom-3 right-0 left-0">
          <h5 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-white text-center ">
            {blog?.title}
          </h5>
          <p className="text-base md:text-lg font-medium leading-[120%] text-white text-center pt-1">
          {blog?.genre[0]?.title || "Genre Not Available"}
        </p>
        </div>
      </div>
      {/* modal open  */}
      {isOpen && (
        <div>
          <ViewDetails
            open={isOpen}
            onOpenChange={() => setIsOpen(false)}
            videoId={selectedVideoId}
          />
        </div>
      )}
    </div>
  );
};

export default MovieCart;
