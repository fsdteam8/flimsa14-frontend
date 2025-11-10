"use client";

import React, { Suspense } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSuspenseQuery, useMutation, useQuery } from "@tanstack/react-query";
import { SingleMovieResponse } from "@/components/types/view-details-page-data-type";
import VideoPlayer from "@/components/video/VideoPlayer";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Bookmark, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface WishlistStatusResponse {
  success: boolean;
  data: {
    inWishlist: boolean;
    wishlistId: string | null;
  };
}

interface LikeStatusResponse {
  success: boolean;
  data: {
    liked: boolean;
    totalLikes: number;
  };
}

const ViewDetails = ({
  open,
  onOpenChange,
  videoId,
}: {
  open: boolean;
  onOpenChange: () => void;
  videoId?: string | null;
}) => {
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string })?.accessToken;

  const { data, isLoading, isError, error } =
    useSuspenseQuery<SingleMovieResponse>({
      queryKey: ["single-movie", videoId],
      queryFn: () =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/movies/${videoId}`).then(
          (res) => res.json()
        ),
      retry: 3,
    });

  const movieId = data?.data?._id;

  const {
    data: wishlistStatus,
    refetch: refetchWishlistStatus,
    isFetching: wishlistFetching,
  } = useQuery<WishlistStatusResponse>({
    queryKey: ["movie-wishlist-status", movieId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/wishlist/status?movieId=${movieId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.json();
    },
    enabled: Boolean(open && token && movieId),
  });

  const {
    data: likeStatus,
    refetch: refetchLikeStatus,
    isFetching: likeFetching,
  } = useQuery<LikeStatusResponse>({
    queryKey: ["movie-like-status", movieId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/likes/status?targetType=movie&movieId=${movieId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.json();
    },
    enabled: Boolean(open && token && movieId),
  });

  const wishlistMutation = useMutation({
    mutationKey: ["movie-wishlist-toggle", movieId],
    mutationFn: async () => {
      if (!token || !movieId) throw new Error("You must be signed in.");
      const inWishlist = wishlistStatus?.data?.inWishlist;
      const endpoint = inWishlist ? "/wishlist/item" : "/wishlist";
      const method = inWishlist ? "DELETE" : "POST";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ movieId }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to update wishlist");
      }
      return json;
    },
    onSuccess: () => {
      refetchWishlistStatus();
      toast.success(
        wishlistStatus?.data?.inWishlist
          ? "Removed from wishlist"
          : "Added to wishlist"
      );
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Unable to update wishlist"
      );
    },
  });

  const likeMutation = useMutation({
    mutationKey: ["movie-like-toggle", movieId],
    mutationFn: async () => {
      if (!token || !movieId) throw new Error("You must be signed in.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/likes/toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetType: "movie",
            movieId,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Unable to update like");
      }
      return json;
    },
    onSuccess: () => {
      refetchLikeStatus();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Unable to like movie");
    },
  });

  if (isError) {
    console.error(error);
    return <div>Error loading movie details</div>;
  }
  if (isLoading) {
    return <div>Loading movie details...</div>;
  }

  const handleWishlistToggle = () => {
    if (!token) {
      toast.info("Sign in to manage your wishlist");
      return;
    }
    wishlistMutation.mutate();
  };

  const handleLikeToggle = () => {
    if (!token) {
      toast.info("Sign in to like this movie");
      return;
    }
    likeMutation.mutate();
  };

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) onOpenChange();
        }}
      >
        <DialogContent className="w-full max-w-5xl border-0 bg-neutral-950/95 p-0 text-white shadow-2xl">
          <ScrollArea className="max-h-[90vh] space-y-4">
            <div className="p-3 pb-0">
              <Suspense fallback={<div>Loading...</div>}>
                <VideoPlayer
                  src={data?.data?.videoUrl || ""}
                  poster={data?.data?.thumbnailUrl || ""}
                  title={data?.data?.title || "Movie Video"}
                  className="mx-auto"
                  movieId={movieId || ""}
                  contentType="movie"
                />
              </Suspense>
            </div>

            <div className="space-y-4 px-4 pb-6">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold md:text-3xl">
                    {data?.data?.title || ""}
                  </h3>
                  <p className="text-sm text-white/70">
                    {data?.data?.releaseDate
                      ? moment(data.data.releaseDate).format("MMMM DD, YYYY")
                      : "Coming soon"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={
                      wishlistStatus?.data?.inWishlist ? "secondary" : "outline"
                    }
                    size="sm"
                    disabled={
                      !token ||
                      wishlistMutation.isPending ||
                      wishlistFetching ||
                      !movieId
                    }
                    onClick={handleWishlistToggle}
                  >
                    <Bookmark
                      className="h-4 w-4"
                      fill={
                        wishlistStatus?.data?.inWishlist ? "#ffffff" : "transparent"
                      }
                    />
                    {wishlistStatus?.data?.inWishlist
                      ? "In wishlist"
                      : "Add to wishlist"}
                  </Button>
                  <Button
                    variant={likeStatus?.data?.liked ? "secondary" : "outline"}
                    size="sm"
                    disabled={
                      !token ||
                      likeMutation.isPending ||
                      likeFetching ||
                      !movieId
                    }
                    onClick={handleLikeToggle}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={likeStatus?.data?.liked ? "#ef4444" : "transparent"}
                    />
                    {likeStatus?.data?.liked ? "Liked" : "Like"}
                    {typeof likeStatus?.data?.totalLikes === "number" && (
                      <span className="text-xs text-white/70">
                        {likeStatus.data.totalLikes}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-white/80 md:text-base">
                {data?.data?.description || ""}
              </p>

              <div className="grid gap-4 rounded-lg border border-white/10 p-4 text-sm text-white/80 md:grid-cols-2 md:text-base">
                <div className="space-y-2">
                  <p>
                    <span className="text-white">Language:</span> {" "}
                    {data?.data?.language || "N/A"}
                  </p>
                  <p>
                    <span className="text-white">Duration:</span> {" "}
                    {data?.data?.duration ? `${data.data.duration} min` : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="text-white">Cast:</span> {" "}
                    {data?.data?.cast.length ? data.data.cast.join(", ") : "N/A"}
                  </p>
                  <p>
                    <span className="text-white">Directors:</span> {" "}
                    {data?.data?.directors.length
                      ? data.data.directors.join(", ")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewDetails;
