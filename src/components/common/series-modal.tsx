"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Bookmark, ChevronDown, Heart, Play, X } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import type { Episode, Season, Series } from "@/types/series";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  message?: string;
}

interface LikeStatusResponse {
  success: boolean;
  data: {
    liked: boolean;
    totalLikes: number;
  };
  message?: string;
}

interface LikesListResponse {
  success: boolean;
  data: Array<{
    _id: string;
    targetType: "series" | "episode";
    series?: { _id: string } | null;
    episodeId?: string;
  }>;
  message?: string;
}

type MaybeNamed =
  | string
  | {
      name?: string;
      title?: string;
      fullName?: string;
      displayName?: string;
    }
  | null
  | undefined;

const pickName = (value: MaybeNamed): string => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return (
    value.name ??
    value.title ??
    value.fullName ??
    value.displayName ??
    ""
  ).toString();
};

const normalizeNames = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (entry && typeof entry === "object") return pickName(entry as MaybeNamed);
        return "";
      })
      .filter(Boolean)
      .map((name) => name.trim());
  }
  if (typeof value === "string") {
    return value.trim() ? [value.trim()] : [];
  }
  if (value && typeof value === "object") {
    const maybe = pickName(value as MaybeNamed);
    return maybe ? [maybe] : [];
  }
  return [];
};

const SeriesModal = ({ series, isOpen, onClose }: SeriesModalProps) => {
  const { data: session } = useSession();
  const token = (session?.user as { accessToken?: string })?.accessToken;

  // Derive first season/episode safely
  const initialSeason = series?.seasons?.[0] ?? null;
  const initialEpisode = initialSeason?.episodes?.[0] ?? null;

  const [selectedSeason, setSelectedSeason] = useState<Season | null>(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(initialEpisode);
  const [playingMode, setPlayingMode] = useState<"trailer" | "episode">("trailer");
  const [showEpisodes, setShowEpisodes] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ensure we only use document in the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset when series changes
  useEffect(() => {
    const hasSeasons = Array.isArray(series.seasons) && series.seasons.length > 0;
    if (!hasSeasons) {
      setSelectedSeason(null);
      setSelectedEpisode(null);
      setPlayingMode("trailer");
      return;
    }
    const firstSeason = series.seasons[0] ?? null;
    setSelectedSeason(firstSeason);
    setSelectedEpisode(firstSeason?.episodes?.[0] ?? null);
    setPlayingMode("trailer");
  }, [series]);

  // Body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;

    const bodyStyle = document.body.style;
    const rootStyle = document.documentElement.style;

    const previous = {
      bodyOverflow: bodyStyle.overflow,
      htmlOverflow: rootStyle.overflow,
      bodyPaddingRight: bodyStyle.paddingRight,
    };

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    bodyStyle.overflow = "hidden";
    rootStyle.overflow = "hidden";
    if (scrollbarWidth > 0) {
      bodyStyle.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      bodyStyle.overflow = previous.bodyOverflow;
      rootStyle.overflow = previous.htmlOverflow;
      bodyStyle.paddingRight = previous.bodyPaddingRight;
    };
  }, [isOpen]);

  // Reset scroll to top on open
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const directors = useMemo(
    () =>
      normalizeNames(
        (series as Record<string, unknown>)["directors"] ??
          (series as Record<string, unknown>)["director"] ??
          (series as Record<string, unknown>)["creators"] ??
          (series as Record<string, unknown>)["creator"]
      ),
    [series]
  );

  const cast = useMemo(
    () =>
      normalizeNames(
        (series as Record<string, unknown>)["cast"] ??
          (series as Record<string, unknown>)["actors"] ??
          (series as Record<string, unknown>)["stars"]
      ),
    [series]
  );

  // If series gained seasons asynchronously and state is null, backfill once
  useEffect(() => {
    if (series.seasons?.length && !selectedSeason) {
      const firstSeason = series.seasons[0];
      setSelectedSeason(firstSeason);
      setSelectedEpisode(firstSeason?.episodes?.[0] ?? null);
      setPlayingMode("trailer");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series.seasons?.length, selectedSeason]);

  // ======= Data fetching (React Query) =======

  const backend = process.env.NEXT_PUBLIC_BACKEND_API;

  const {
    data: wishlistStatus,
    refetch: refetchWishlistStatus,
    isFetching: wishlistFetching,
  } = useQuery<WishlistStatusResponse>({
    queryKey: ["series-wishlist-status", series._id],
    queryFn: async () => {
      const res = await fetch(`${backend}/wishlist/status?seriesId=${series._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as WishlistStatusResponse;
      return json;
    },
    enabled: Boolean(isOpen && token && backend),
  });

  const {
    data: seriesLikeStatus,
    refetch: refetchSeriesLikeStatus,
    isFetching: seriesLikeFetching,
  } = useQuery<LikeStatusResponse>({
    queryKey: ["series-like-status", series._id],
    queryFn: async () => {
      const res = await fetch(
        `${backend}/likes/status?targetType=series&seriesId=${series._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = (await res.json()) as LikeStatusResponse;
      return json;
    },
    enabled: Boolean(isOpen && token && backend),
  });

  const { data: likesList, refetch: refetchLikesList } = useQuery<LikesListResponse>({
    queryKey: ["user-likes"],
    queryFn: async () => {
      const res = await fetch(`${backend}/likes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as LikesListResponse;
      return json;
    },
    enabled: Boolean(isOpen && token && backend),
  });

  const likedEpisodeSet = useMemo(() => {
    if (!likesList?.data) return new Set<string>();
    return new Set(
      likesList.data
        .filter((like) => like.targetType === "episode" && like.series?._id === series._id)
        .map((like) => like.episodeId || "")
        .filter(Boolean)
    );
  }, [likesList, series._id]);

  const wishlistMutation = useMutation({
    mutationKey: ["series-wishlist-toggle", series._id],
    mutationFn: async () => {
      if (!token) throw new Error("You must be signed in.");
      if (!backend) throw new Error("Backend API is not configured.");
      const inWishlist = Boolean(wishlistStatus?.data?.inWishlist);
      const endpoint = inWishlist ? "/wishlist/item" : "/wishlist";
      const method = inWishlist ? "DELETE" : "POST";
      const res = await fetch(`${backend}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seriesId: series._id }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to update wishlist");
      }
      return json;
    },
    onSuccess: () => {
      // refetch current status, then toast based on new cached value after refetch
      refetchWishlistStatus().then((out) => {
        const nowInWishlist = Boolean(out.data?.data?.inWishlist);
        toast.success(nowInWishlist ? "Added to wishlist" : "Removed from wishlist");
      });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to update wishlist");
    },
  });

  const likeSeriesMutation = useMutation({
    mutationKey: ["series-like-toggle", series._id],
    mutationFn: async () => {
      if (!token) throw new Error("You must be signed in.");
      if (!backend) throw new Error("Backend API is not configured.");
      const res = await fetch(`${backend}/likes/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: "series",
          seriesId: series._id,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Unable to like series");
      }
      return json;
    },
    onSuccess: () => {
      refetchSeriesLikeStatus();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to like series");
    },
  });

  const episodeLikeMutation = useMutation({
    mutationKey: ["episode-like-toggle", series._id],
    mutationFn: async (episode: Episode) => {
      if (!token) throw new Error("You must be signed in.");
      if (!backend) throw new Error("Backend API is not configured.");
      if (!episode?._id) throw new Error("Episode id is missing.");
      const res = await fetch(`${backend}/likes/toggle`, {
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
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Unable to like episode");
      }
      return json;
    },
    onSuccess: () => {
      refetchLikesList();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to like episode");
    },
  });

  // ======= Handlers =======

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

  // Normalize genres to strings for safe rendering. Always run before early returns
  const normalizedGenres: string[] = useMemo(() => {
    const raw = (series as unknown as { genre?: unknown }).genre;
    const names = normalizeNames(raw);
    if (names.length) return names;
    return [];
  }, [series]);

  if (!isOpen || !mounted) return null;

  const currentVideoUrl =
    playingMode === "episode" && selectedEpisode?.videoUrl
      ? selectedEpisode.videoUrl
      : selectedSeason?.trailerUrl ||
        series.trailerUrl ||
        selectedEpisode?.videoUrl ||
        "";

  const currentPoster =
    playingMode === "episode"
      ? selectedEpisode?.thumbnailUrl || series.thumbnailUrl
      : series.thumbnailUrl;

  const focusPlayer = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSeasonChange = (season: Season) => {
    setSelectedSeason(season ?? null);
    setSelectedEpisode(season?.episodes?.[0] ?? null);
    setPlayingMode("trailer");
    focusPlayer();
  };

  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(episode ?? null);
    setPlayingMode("episode");
    focusPlayer();
  };

  const toggleEpisodes = () => {
    setShowEpisodes((prev) => !prev);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => focusPlayer());
    } else {
      focusPlayer();
    }
  };

  const onDescKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setDetailsOpen((prev) => !prev);
    }
  };

  const onEpisodeCardKey =
    (episode: Episode) => (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleEpisodeClick(episode);
      }
    };

  const renderReleaseDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return createPortal(
    <React.Fragment>
      <div
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-50 flex justify-center p-0 sm:p-3 md:p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`${series.title} details`}
      >
        <div
          ref={scrollContainerRef}
          className="modern-scrollbar relative h-screen w-screen max-w-5xl overflow-y-auto bg-neutral-900 sm:my-4 sm:w-full sm:rounded-xl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-50 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 md:right-6 md:top-6"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {currentVideoUrl && (
            <div ref={heroRef} className="sticky top-0 z-30 lg:static">
              <VideoPlayer
                videoUrl={currentVideoUrl}
                poster={currentPoster || "/placeholder.svg?height=400&width=800"}
                title={
                  playingMode === "episode"
                    ? `${series.title} - Ep ${selectedEpisode?.episodeNumber ?? ""}`
                    : `${series.title} - Trailer`
                }
                className="w-full"
                movieId={series._id}
                seriesId={series._id}
                episodeId={playingMode === "episode" ? selectedEpisode?._id : undefined}
                seasonNumber={selectedSeason?.seasonNumber}
                episodeNumber={selectedEpisode?.episodeNumber}
                contentType={playingMode === "episode" ? "episode" : "movie"}
                trackHistory={playingMode === "episode"}
              />
            </div>
          )}

          <div className="space-y-6 p-4 md:p-6 lg:p-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                {series.title}
              </h2>

              <div
                role="button"
                tabIndex={0}
                aria-expanded={detailsOpen}
                onClick={() => setDetailsOpen((prev) => !prev)}
                onKeyDown={onDescKey}
                className="group cursor-pointer select-text text-sm text-neutral-300 md:text-base"
              >
                <p
                  className={`transition-all ${
                    detailsOpen ? "" : "line-clamp-2 md:line-clamp-3"
                  }`}
                >
                  {series.description}
                </p>
                {!detailsOpen && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-400">
                    Show more
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                  </span>
                )}

                {detailsOpen && (
                  <div className="mt-3 space-y-3">
                    {directors.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs uppercase tracking-wide text-neutral-400 md:text-sm">
                          Director
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {directors.map((name, index) => (
                            <span
                              key={`${name}-${index}`}
                              className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200 md:text-sm"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cast.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs uppercase tracking-wide text-neutral-400 md:text-sm">
                          Cast
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cast.map((name, index) => (
                            <span
                              key={`${name}-${index}`}
                              className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200 md:text-sm"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {normalizedGenres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {normalizedGenres.map((g, index) => (
                    <span
                      key={`${g}-${index}`}
                      className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 md:text-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* <div className="flex flex-wrap gap-3 border-y border-neutral-800 py-4">
              <Button
                variant={wishlistStatus?.data?.inWishlist ? "secondary" : "outline"}
                size="sm"
                onClick={handleWishlistToggle}
                disabled={
                  !token ||
                  wishlistMutation.isPending ||
                  wishlistFetching ||
                  !isOpen
                }
                className="flex items-center gap-2"
              >
                <Bookmark
                  className="h-4 w-4"
                  fill={wishlistStatus?.data?.inWishlist ? "currentColor" : "none"}
                />
                {wishlistStatus?.data?.inWishlist ? "In wishlist" : "Add to wishlist"}
              </Button>

              <Button
                variant={seriesLikeStatus?.data?.liked ? "secondary" : "outline"}
                size="sm"
                onClick={handleSeriesLikeToggle}
                disabled={
                  !token ||
                  likeSeriesMutation.isPending ||
                  seriesLikeFetching ||
                  !isOpen
                }
                className="flex items-center gap-2"
              >
                <Heart
                  className="h-4 w-4"
                  fill={seriesLikeStatus?.data?.liked ? "#ef4444" : "none"}
                  color={seriesLikeStatus?.data?.liked ? "#ef4444" : "currentColor"}
                />
                {seriesLikeStatus?.data?.liked ? "Liked" : "Like series"}
                {typeof seriesLikeStatus?.data?.totalLikes === "number" && (
                  <span className="text-xs text-white/70">
                    {seriesLikeStatus.data.totalLikes}
                  </span>
                )}
              </Button>
            </div> */}

            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-bold text-white md:text-xl">Episodes</h3>

                {series.seasons?.length ? (
                  <div className="relative inline-flex w-full md:w-auto">
                    <select
                      value={selectedSeason?._id ?? ""}
                      onChange={(event) => {
                        const season = series.seasons!.find(
                          (entry) => entry._id === event.target.value
                        );
                        if (season) handleSeasonChange(season);
                      }}
                      className="w-full appearance-none rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-white transition hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 md:w-auto md:py-2.5 md:text-base"
                    >
                      {series.seasons.map((season) => (
                        <option key={season._id} value={season._id}>
                          Season {season.seasonNumber}
                          {season.name ? ` - ${season.name}` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={toggleEpisodes}
                className="w-full rounded-lg bg-neutral-800 py-2 text-sm text-white transition-colors hover:bg-neutral-700 md:hidden"
              >
                {showEpisodes ? "Hide Episodes" : "Show Episodes"}
              </button>
            </div>

            {showEpisodes && (
              <div className="space-y-2 md:space-y-3">
                {selectedSeason?.episodes?.length ? (
                  <div className="grid gap-2 md:gap-3">
                    {selectedSeason.episodes.map((episode, index) => (
                      <div
                        role="button"
                        tabIndex={0}
                        key={episode._id ?? `episode-${index}`}
                        onClick={() => handleEpisodeClick(episode)}
                        onKeyDown={onEpisodeCardKey(episode)}
                        className={`group flex w-full gap-3 rounded-lg p-3 text-left transition-all md:p-4 ${
                          selectedEpisode?._id === episode._id
                            ? "bg-neutral-800 ring-1 ring-neutral-600 shadow-md"
                            : "bg-neutral-900 hover:bg-neutral-800"
                        }`}
                        aria-label={`Play Episode ${episode.episodeNumber}: ${episode.title}`}
                      >
                        <div className="relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded bg-neutral-700 md:w-28">
                          <Image
                            src={
                              episode.thumbnailUrl ||
                              "/placeholder.svg?height=150&width=250"
                            }
                            alt={`Episode ${episode.episodeNumber}`}
                            fill
                            sizes="(max-width: 768px) 96px, 112px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 transition-colors group-hover:bg-white/40">
                              <Play className="ml-0.5 h-4 w-4 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 py-1">
                          <div className="mb-1.5 flex items-start justify-between gap-2">
                            <span className="line-clamp-2 text-sm font-semibold text-white md:text-base">
                              Ep {episode.episodeNumber}: {episode.title}
                            </span>
                            {episode.duration > 0 && (
                              <span className="flex-shrink-0 text-xs text-neutral-400 md:text-sm">
                                {Math.floor(episode.duration / 60)}m
                              </span>
                            )}
                          </div>

                          <p className="mb-1.5 text-xs text-neutral-300 line-clamp-2 md:text-sm">
                            {episode.description}
                          </p>

                          {renderReleaseDate(episode.releaseDate) && (
                            <p className="text-xs text-neutral-500">
                              {renderReleaseDate(episode.releaseDate)}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEpisodeLike(episode);
                          }}
                          disabled={episodeLikeMutation.isPending || !token || !episode._id}
                          aria-pressed={episode._id ? likedEpisodeSet.has(episode._id) : false}
                          className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-700 text-neutral-200 transition hover:bg-neutral-800"
                          aria-label={
                            episode._id && likedEpisodeSet.has(episode._id)
                              ? "Unlike episode"
                              : "Like episode"
                          }
                        >
                          {/* <Heart
                            className="h-4 w-4"
                            fill={
                              episode._id && likedEpisodeSet.has(episode._id) ? "#ef4444" : "none"
                            }
                            color={
                              episode._id && likedEpisodeSet.has(episode._id)
                                ? "#ef4444"
                                : "currentColor"
                            }
                          /> */}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-neutral-400">
                    <p>No episodes available for this season</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>,
    document.body
  );
};

export default SeriesModal;
