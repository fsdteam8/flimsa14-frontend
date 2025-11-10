"use client";
import React, { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import VideoPlayer from "@/components/video/VideoPlayer";

export interface WishlistEntryResponse {
  success: boolean;
  message: string;
  data: WishlistEntry;
}

export interface WishlistEntry {
  _id: string;
  user: User;
  movieId: Movie;
  whished: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface User {
  avatar: {
    public_id: string;
    url: string;
  };
  verificationInfo: {
    verified: boolean;
    token: string;
  };
  _id: string;
  name: string;
  email: string;
  credit: number | null;
  role: string;
  enableNotifications: boolean;
  dnd: boolean;
  totalPosts: number;
  password_reset_token: string;
  fine: number;
  refreshToken: string;
  currentPlan: string;
  subscription: string;
  savedItems: [];
  purchases: [];
  totalSavings: number;
  avgSavings: number;
  review: [];
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

const ViewDetails = ({ wishListId }: { wishListId?: string | null }) => {
    const session = useSession();
    const token = (session?.data?.user as { accessToken: string })?.accessToken || "";

  const { data, isLoading, isError, error } =
    useSuspenseQuery<WishlistEntryResponse>({
      queryKey: ["wishlist details", wishListId],
      queryFn: () =>
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/wishlist/${wishListId}`,{
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json()),
      retry: 3,
    });


  if (isError) {
    console.error(error);
    return <div>Error loading popular movies</div>;
  }
  if (isLoading) {
    return <div>Loading popular movies...</div>;
  }

  return (
    <div className="container">
      <div className="w-full p-2">
        <Suspense fallback={<div>Loading...</div>}>
          <VideoPlayer
            src={data?.data?.movieId?.videoUrl || ""}
            poster={data?.data?.movieId?.thumbnailUrl || ""}
            title={data?.data?.movieId?.title || "Movie Video"}
            className=" mx-auto"
            movieId={data?.data?.movieId?._id || ""}
            contentType="movie"
          />
        </Suspense>
      </div>
      <div  className="container grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-6">
        <div className="md:col-span-1">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[120%] text-white">
            {data?.data?.movieId?.title || ""}
          </h3>
          <p className="text-base md:text-lg font-normal leading-[120%] text-white py-2">
            {data?.data?.movieId?.description || ""}
          </p>
        </div>
        <div className="md:col-span-1">
          <h4 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-[120%] text-white">
            <strong>Director Name :</strong>{" "}
            {data?.data?.movieId?.directors.join(", ") || ""}
          </h4>
          <p className="text-base md:text-lg font-normal leading-[120%] text-white py-2">
            <strong>Duration :</strong> {data?.data?.movieId?.duration || ""}
          </p>
          <p className="text-base md:text-lg font-normal leading-[120%] text-white">
            <strong>Language :</strong> {data?.data?.movieId?.language || ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewDetails;
