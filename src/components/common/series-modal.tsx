"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoPlayer from "@/components/video/VideoPlayer";
import type { Series, Season, Episode } from "@/types/series";
import { Button } from "@/components/ui/button";
import { Bookmark, Heart, Play } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import moment from "moment";
import { toast } from "react-toastify";

interface SeriesModalProps {
  series: Series;
  isOpen: boolean;
  onClose: () => void;
}

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

interface LikesListResponse {
  success: boolean;
  data: Array<{
    _id: string;
    targetType: string;
    series?: { _id: string } | null;
    episodeId?: string;
  }>;
}

const getGenreTitle = (genre?: { title?: string; name?: string }) =>
  genre?.title || genre?.name || "Genre";

const SeriesModal: React.FC<SeriesModalProps> = ({ series, isOpen, onClose }) => {
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string })?.accessToken;
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(
    series.seasons[0] ?? null
  );
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(
    series.seasons[0]?.episodes?.[0] ?? null
  );
  const [playingMode, setPlayingMode] =
    useState<"trailer" | "episode">("trailer");

  useEffect(() => {
    setSelectedSeason(series.seasons[0] ?? null);
    setSelectedEpisode(series.seasons[0]?.episodes?.[0] ?? null);
    setPlayingMode("trailer");
  }, [series]);

  const currentVideoSrc =
    playingMode === "episode" && selectedEpisode?.videoUrl
      ? selectedEpisode.videoUrl
      : selectedSeason?.trailerUrl || series.trailerUrl || "";

  const currentPoster =
    playingMode === "episode"
      ? selectedEpisode?.thumbnailUrl || series.thumbnailUrl
      : series.thumbnailUrl;

  const {
    data: wishlistStatus,
    refetch: refetchWishlistStatus,
    isFetching: wishlistFetching,
  } = useQuery<WishlistStatusResponse>({
    queryKey: ["series-wishlist-status", series._id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/wishlist/status?seriesId=${series._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.json();
    },
    enabled: Boolean(isOpen && token),
  });

  const {
    data: seriesLikeStatus,
    refetch: refetchSeriesLikeStatus,
    isFetching: seriesLikeFetching,
  } = useQuery<LikeStatusResponse>({
    queryKey: ["series-like-status", series._id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/likes/status?targetType=series&seriesId=${series._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.json();
    },
    enabled: Boolean(isOpen && token),
  });

  const {
    data: likesList,
    refetch: refetchLikesList,
  } = useQuery<LikesListResponse>({
    queryKey: ["user-likes"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/likes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.json();
    },
    enabled: Boolean(isOpen && token),
  });

  const likedEpisodeSet = useMemo(() => {
    if (!likesList?.data) return new Set<string>();
    return new Set(
      likesList.data
        .filter(
          (like) =>
            like.targetType === "episode" && like.series?._id === series._id
        )
        .map((like) => like.episodeId || "")
        .filter(Boolean)
    );
  }, [likesList, series._id]);

  const wishlistMutation = useMutation({
    mutationKey: ["series-wishlist-toggle", series._id],
    mutationFn: async () => {
      if (!token) throw new Error("You must be signed in.");
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
          body: JSON.stringify({ seriesId: series._id }),
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

  const likeSeriesMutation = useMutation({
    mutationKey: ["series-like-toggle", series._id],
    mutationFn: async () => {
      if (!token) throw new Error("You must be signed in.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/likes/toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetType: "series",
            seriesId: series._id,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Unable to like series");
      }
      return json;
    },
    onSuccess: () => {
      refetchSeriesLikeStatus();
      refetchLikesList();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Unable to like series");
    },
  });

  const episodeLikeMutation = useMutation({
    mutationFn: async (episode: Episode) => {
      if (!token) throw new Error("You must be signed in.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/likes/toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetType: "episode",
            seriesId: series._id,
            episodeId: episode._id,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Unable to like episode");
      }
      return json;
    },
    onSuccess: () => {
      refetchLikesList();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Unable to like episode");
    },
  });

  const handleWishlistToggle = () => {
    if (!token) {
      toast.info("Sign in to manage your wishlist");
      return;
    }
    wishlistMutation.mutate();
  };

  const handleSeriesLikeToggle = () => {
    if (!token) {
      toast.info("Sign in to like this series");
      return;
    }
    likeSeriesMutation.mutate();
  };

  const handleEpisodeLike = (episode: Episode) => {
    if (!token) {
      toast.info("Sign in to like this episode");
      return;
    }
    episodeLikeMutation.mutate(episode);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="w-full max-w-6xl border-0 bg-neutral-950/95 p-0 text-white">
        <ScrollArea className="max-h-[90vh] space-y-4">
          <div className="p-4 pb-0">
            <VideoPlayer
              src={currentVideoSrc}
              poster={currentPoster || "/assets/images/no-img-available.jpg"}
              title={
                playingMode === "episode"
                  ? `${series.title} - Episode ${selectedEpisode?.episodeNumber ?? ""}`
                  : `${series.title} - Trailer`
              }
              className="w-full"
              seriesId={series._id}
              episodeId={playingMode === "episode" ? selectedEpisode?._id : undefined}
              seasonNumber={selectedSeason?.seasonNumber}
              episodeNumber={selectedEpisode?.episodeNumber}
              contentType={playingMode === "episode" ? "episode" : "movie"}
              trackHistory={playingMode === "episode"}
              videoUrl={currentVideoSrc}
            />
          </div>

          <div className="space-y-4 px-4 pb-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold md:text-3xl">{series.title}</h2>
                <p className="text-sm text-white/70">
                  {series.status ? series.status.toUpperCase() : ""} -
                  {series.genre.map((genre) => getGenreTitle(genre)).join(", ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={
                    wishlistStatus?.data?.inWishlist ? "secondary" : "outline"
                  }
                  size="sm"
                  disabled={!token || wishlistMutation.isPending || wishlistFetching}
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
                  variant={seriesLikeStatus?.data?.liked ? "secondary" : "outline"}
                  size="sm"
                  disabled={!token || likeSeriesMutation.isPending || seriesLikeFetching}
                  onClick={handleSeriesLikeToggle}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={seriesLikeStatus?.data?.liked ? "#ef4444" : "transparent"}
                  />
                  {seriesLikeStatus?.data?.liked ? "Liked" : "Like series"}
                  {typeof seriesLikeStatus?.data?.totalLikes === "number" && (
                    <span className="text-xs text-white/70">
                      {seriesLikeStatus.data.totalLikes}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-sm text-white/80 md:text-base">
              {series.description}
            </p>

            <div className="grid gap-4 rounded-lg border border-white/10 p-4 text-sm text-white/80 md:grid-cols-2">
              <div className="space-y-2">
                <p>
                  <span className="text-white">Cast:</span> {" "}
                  {series.cast?.length ? series.cast.join(", ") : "N/A"}
                </p>
                <p>
                  <span className="text-white">Directors:</span> {" "}
                  {series.directors?.length ? series.directors.join(", ") : "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="text-white">Seasons:</span> {series.seasons.length || 0}
                </p>
                <p>
                  <span className="text-white">Updated:</span> {" "}
                  {series.updatedAt
                    ? moment(series.updatedAt).format("MMM DD, YYYY")
                    : "N/A"}
                </p>
              </div>
            </div>

            {series.seasons.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold">Episodes</h3>
                  <select
                    className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm md:w-60"
                    value={selectedSeason?._id || ""}
                    onChange={(event) => {
                      const season = series.seasons.find(
                        (item) => item._id === event.target.value
                      );
                      if (season) {
                        setSelectedSeason(season);
                        setSelectedEpisode(season.episodes[0] ?? null);
                        setPlayingMode(season.episodes.length ? "episode" : "trailer");
                      }
                    }}
                  >
                    {series.seasons.map((season) => (
                      <option key={season._id} value={season._id}>
                        {`Season ${season.seasonNumber}${
                          season.name ? ` - ${season.name}` : ""
                        }`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {selectedSeason?.episodes?.length ? (
                    selectedSeason.episodes.map((episode) => {
                      const isActive = selectedEpisode?._id === episode._id;
                      const liked = likedEpisodeSet.has(episode._id);
                      return (
                        <div
                          key={episode._id}
                          className={`flex items-start gap-3 rounded-lg border border-white/10 p-3 transition ${
                            isActive ? "bg-white/5" : "bg-transparent"
                          }`}
                        >
                          <button
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
                            onClick={() => {
                              setSelectedEpisode(episode);
                              setPlayingMode("episode");
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <div className="flex flex-1 flex-col gap-1 text-left">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium capitalize md:text-base">
                                Episode {episode.episodeNumber}: {episode.title}
                              </p>
                              <button
                                className={`inline-flex items-center gap-1 text-xs ${
                                  liked ? "text-red-400" : "text-white/60"
                                }`}
                                onClick={() => handleEpisodeLike(episode)}
                                disabled={episodeLikeMutation.isPending}
                              >
                                <Heart
                                  className="h-3.5 w-3.5"
                                  fill={liked ? "#ef4444" : "transparent"}
                                />
                                Like
                              </button>
                            </div>
                            <p className="text-xs text-white/70 md:text-sm">
                              {episode.description}
                            </p>
                            <p className="text-xs text-white/50">
                              {episode.duration ? `${episode.duration} min - ` : ""}
                              {episode.releaseDate
                                ? moment(episode.releaseDate).format("MMM DD, YYYY")
                                : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-dashed border-white/20 p-6 text-center text-white/70">
                      Episodes for this season are coming soon.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SeriesModal;
