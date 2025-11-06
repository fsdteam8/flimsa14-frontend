"use client";
import ViewDetails from "@/app/_components/view-details";
import ErrorContainer from "@/components/shared/ErrorContainer/ErrorContainer";
import NotFound from "@/components/shared/NotFound/NotFound";
import SkeletonWrapper from "@/components/shared/SkeletonWrapper/SkeletonWrapper";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: WishlistItem[];
}

export interface WishlistItem {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  movieId: Movie;
  whished: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseDate: string;
  genre: Genre[];
  language: string;
  duration: number;
  cast: string[];
  directors: string[];
  thumbnailUrl: string;
  trailerUrl: string;
  videoUrl: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Genre {
  _id: string;
  user: string;
  title: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}


const WishlistContainer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;

  const { data, isLoading, isError, error } = useQuery<WishlistResponse>({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/wishlist`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.json();
    },
    enabled: !!token,
  });

  console.log(data?.data);

    if (isLoading) {
    return (
      <div className="pt-10">
        <SkeletonWrapper count={4} />
      </div>
    );
  } else if (isError) {
    return (
      <div className="pt-10">
        <ErrorContainer message={error?.message || "Something went wrong"} />
      </div>
    );
  } else if (!data || data?.data?.length === 0) {
    return (
      <div className="pt-10">
        <NotFound message="Oops! No data available. Modify your filters or check your internet connection." />
      </div>
    );
  }
  return (
    <div className="container text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
        {data?.data?.map((item: WishlistItem) => {
          console.log(item)
          return (
            <div key={item?._id} className="">
              <div>
                <div
                  onClick={() => {
                    setIsOpen(true);
                    setSelectedVideoId(item?._id || null);
                  }}
                  className="relative"
                >
                  <div
                    style={{ backgroundImage: `url(${item?.movieId?.thumbnailUrl  }) ` }}
                    className="bg-cover bg-center bg-no-repeat h-[350px] w-full object-cover rounded-[14px] cursor-pointer"
                  ></div>
                  <div className="absolute bottom-3 right-0 left-0">
                    <h5 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-white text-center ">
                      {item?.movieId?.title}
                    </h5>
                    <p className="text-base md:text-lg font-medium leading-[120%] text-white text-center pt-1">
                      {/* {item?.genre[0]?.title || "Genre Not Available"} */}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistContainer;
