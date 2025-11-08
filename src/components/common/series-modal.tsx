"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X, ChevronDown, Play } from "lucide-react"
import Image from "next/image"
import VideoPlayer from "../video/VideoPlayer"
import type { Series, Season, Episode } from "@/app/_components/series-movies"

interface SeriesModalProps {
  series: Series
  isOpen: boolean
  onClose: () => void
}

export default function SeriesModal({ series, isOpen, onClose }: SeriesModalProps) {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [playingMode, setPlayingMode] = useState<"trailer" | "episode">("trailer")
  const [showEpisodes, setShowEpisodes] = useState(true)
  const [mounted, setMounted] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Initialize with first season/episode
  useEffect(() => {
    if (series.seasons.length > 0 && !selectedSeason) {
      const firstSeason = series.seasons[0]
      setSelectedSeason(firstSeason)
      if (firstSeason.episodes.length > 0) {
        setSelectedEpisode(firstSeason.episodes[0])
      }
    }
  }, [series, selectedSeason])

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const currentVideoUrl =
    playingMode === "episode" && selectedEpisode
      ? selectedEpisode.videoUrl
      : selectedSeason?.trailerUrl || series.trailerUrl

  const focusPlayer = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleSeasonChange = (season: Season) => {
    setSelectedSeason(season)
    if (season.episodes.length > 0) setSelectedEpisode(season.episodes[0])
    setPlayingMode("trailer")
    focusPlayer()
  }

  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(episode)
    setPlayingMode("episode")
    focusPlayer()
  }

  const toggleEpisodes = () => {
    setShowEpisodes((prev) => !prev)
    requestAnimationFrame(focusPlayer)
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex justify-center p-0 sm:p-3 md:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          ref={scrollContainerRef}
          className="relative w-screen sm:w-full max-w-5xl bg-gray-900 rounded-none sm:rounded-xl overflow-y-auto my-0 sm:my-4"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition md:top-6 md:right-6"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Hero Section (sticky; no extra wrapper → no black bar) */}
          {currentVideoUrl && (
            <div ref={heroRef} className="sticky top-0 z-30">
              <VideoPlayer
                videoUrl={currentVideoUrl}
                poster={series.thumbnailUrl || "/placeholder.svg?height=400&width=800"}
                title={series.title}
                movieId={series._id}
                className="w-full"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Title & Info */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{series.title}</h2>
              <p className="text-sm md:text-base text-gray-300 line-clamp-2 md:line-clamp-3">{series.description}</p>

              {series.genre.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {series.genre.map((gen) => (
                    <span
                      key={gen._id}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs md:text-sm rounded-full transition-colors"
                    >
                      {gen.title}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Season Selector */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h3 className="text-lg md:text-xl font-bold text-white">Episodes</h3>

                {series.seasons.length > 0 && (
                  <div className="relative inline-flex w-full md:w-auto">
                    <select
                      value={selectedSeason?._id || ""}
                      onChange={(e) => {
                        const season = series.seasons.find((s) => s._id === e.target.value)
                        if (season) handleSeasonChange(season)
                      }}
                      className="w-full md:w-auto appearance-none bg-gray-800 text-white px-4 py-2 md:py-2.5 rounded-lg border border-gray-700 hover:border-gray-600 transition cursor-pointer pr-10 text-sm md:text-base"
                    >
                      {series.seasons.map((season) => (
                        <option key={season._id} value={season._id}>
                          Season {season.seasonNumber}
                          {season.name && ` - ${season.name}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Toggle Episodes on Mobile */}
              <button
                onClick={toggleEpisodes}
                className="md:hidden w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                {showEpisodes ? "Hide Episodes" : "Show Episodes"}
              </button>
            </div>

            {/* Episodes (no nested scroll on mobile; desktop has contained scroll) */}
            {showEpisodes && (
              <div className="space-y-2 md:space-y-3 md:max-h-96 md:overflow-y-auto">
                {selectedSeason?.episodes?.length ? (
                  <div className="grid gap-2 md:gap-3">
                    {selectedSeason.episodes.map((episode, index) => (
                      <button
                        key={episode._id || index}
                        onClick={() => handleEpisodeClick(episode)}
                        className={`group w-full flex gap-3 p-3 md:p-4 rounded-lg transition-all ${
                          selectedEpisode?._id === episode._id
                            ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-400"
                            : "bg-gray-800 hover:bg-gray-700"
                        }`}
                      >
                        {/* Thumb */}
                        <div className="relative w-24 md:w-28 flex-shrink-0 aspect-video bg-gray-700 rounded overflow-hidden">
                          <Image
                            src={episode.thumbnailUrl || "/placeholder.svg?height=150&width=250"}
                            alt={`Episode ${episode.episodeNumber}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/30 group-hover:bg-white/50 transition-colors">
                              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0 py-1">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-white font-semibold text-sm md:text-base line-clamp-2">
                              Ep {episode.episodeNumber}: {episode.title}
                            </span>
                            {episode.duration > 0 && (
                              <span className="text-gray-400 text-xs md:text-sm flex-shrink-0 whitespace-nowrap">
                                {Math.floor(episode.duration / 60)}m
                              </span>
                            )}
                          </div>

                          <p className="text-gray-300 text-xs md:text-sm line-clamp-2 mb-1.5">
                            {episode.description}
                          </p>

                          {episode.releaseDate && (
                            <p className="text-gray-500 text-xs">
                              {new Date(episode.releaseDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No episodes available for this season</p>
                  </div>
                )}
              </div>
            )}

            {/* Playback Mode Indicator */}
            <div className="pt-2 border-t border-gray-700 text-xs md:text-sm text-gray-400">
              {playingMode === "trailer" ? (
                <span>🎬 Now playing: Season {selectedSeason?.seasonNumber} Trailer</span>
              ) : (
                <span>
                  ▶ Now playing: Episode {selectedEpisode?.episodeNumber} - {selectedEpisode?.title}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
