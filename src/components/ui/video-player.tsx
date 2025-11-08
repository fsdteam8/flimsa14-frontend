"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Hls from "hls.js"
import { useSession } from "next-auth/react"

interface VideoPlayerProps {
  src?: string
  videoUrl?: string
  poster?: string
  title?: string
  className?: string
  movieId: string
}

const qualityLabels: Record<string | number, string> = {
  "-1": "Auto",
  360: "360p",
  480: "480p",
  720: "720p",
  1080: "1080p",
}

const MAX_RETRIES = 4
const AUTOPLAY_MAX_ATTEMPTS = 4
const CONTROLS_HIDE_MS = 3000

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  videoUrl,
  className = "",
  poster = "/placeholder.svg?height=300&width=500",
  title = "Video Player",
  movieId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)

  const hlsRef = useRef<Hls | null>(null)
  const hlsHandlersBoundRef = useRef(false)

  const cleanupRef = useRef<(() => void) | null>(null)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestSourceRef = useRef("")
  const autoplayAttemptsRef = useRef(0)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPointerRef = useRef<{ time: number; pointerType: string } | null>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [skipFeedback, setSkipFeedback] = useState<{ direction: "left" | "right"; key: string } | null>(null)

  const firstPlaybackDoneRef = useRef(false)

  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const isIOS = useMemo(() => typeof navigator !== "undefined" && /iP(ad|hone|od)/i.test(navigator.userAgent), [])

  const resolvedSrc = useMemo(() => {
    if (typeof src === "string" && src.trim()) return src.trim()
    if (typeof videoUrl === "string" && videoUrl.trim()) return videoUrl.trim()
    return ""
  }, [src, videoUrl])

  latestSourceRef.current = resolvedSrc

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [levels, setLevels] = useState<Array<{ height: number }>>([])
  const [currentLevel, setCurrentLevel] = useState(-1)
  const [volume, setVolume] = useState(1)
  const [controlsVisible, setControlsVisible] = useState(true)

  const formatTime = (sec: number) => {
    if (Number.isNaN(sec)) return "0:00"
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? `0${s}` : s}`
  }

  const showControls = useCallback(
    (autoHide = true) => {
      setControlsVisible(true)
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
      if (autoHide && isPlaying) {
        controlsTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS)
      }
    },
    [isPlaying],
  )

  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }

  const registerCleanup = (fn: () => void) => {
    const wrapped = () => {
      fn()
      if (cleanupRef.current === wrapped) cleanupRef.current = null
    }
    cleanupRef.current = wrapped
    return wrapped
  }

  const runCleanup = () => {
    if (cleanupRef.current) cleanupRef.current()
  }

  const tryAutoPlay = (force = false) => {
    const video = videoRef.current
    if (!video) return

    video.defaultMuted = true
    video.muted = true
    video.autoplay = true

    if (!force && !video.paused) return
    if (autoplayAttemptsRef.current >= AUTOPLAY_MAX_ATTEMPTS) return

    autoplayAttemptsRef.current += 1
    const p = video.play()
    if (p?.catch) {
      p.catch(() => {
        setTimeout(() => tryAutoPlay(true), 140)
      })
    }
  }

  const scheduleRetry = (reason: string) => {
    clearRetryTimeout()
    setRetryCount((prev) => {
      if (prev >= MAX_RETRIES) {
        setError("An error occurred while loading the video.")
        setLoading(false)
        return prev
      }
      const next = prev + 1
      const delay = Math.min(1000 * 2 ** (next - 1), 10000)
      setLoading(true)
      retryTimeoutRef.current = setTimeout(() => {
        setError(null)
        loadSource(latestSourceRef.current)
      }, delay)
      return next
    })
  }

  const sendHistory = useCallback(() => {
    if (!videoRef.current || !duration || !movieId || !token) return
    const progress = Math.round((videoRef.current.currentTime / duration) * 100)
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId, progress }),
    }).catch(() => {})
  }, [duration, movieId, token])

  const bindVideoListeners = () => {
    const video = videoRef.current
    if (!video) return () => {}

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setLoading(false)
      tryAutoPlay(true)
      showControls(true)
    }
    const handleCanPlay = () => {
      setLoading(false)
      tryAutoPlay(true)
      showControls(true)
    }
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }
    const handleVideoError = () => scheduleRetry("video-error")

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("volumechange", handleVolumeChange)
    video.addEventListener("error", handleVideoError)

    if (isIOS) {
      ;(video as any).addEventListener?.("webkitbeginfullscreen", () => showControls(true))
      ;(video as any).addEventListener?.("webkitendfullscreen", () => showControls(true))
    }

    return registerCleanup(() => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("volumechange", handleVolumeChange)
      video.removeEventListener("error", handleVideoError)
    })
  }

  const ensureHls = () => {
    if (isIOS || !Hls.isSupported()) return null

    let hls = hlsRef.current
    if (!hls) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        startLevel: -1,
        autoStartLoad: true,
      })
      hlsRef.current = hls

      if (!hlsHandlersBoundRef.current) {
        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          const filtered = data.levels.filter((lvl: { height: number }) => [360, 480, 720, 1080].includes(lvl.height))
          setLevels(filtered)
          setCurrentLevel(-1)
          setLoading(false)
          setRetryCount(0)
          tryAutoPlay(true)
        })

        hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => setCurrentLevel(data.level))

        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!hlsRef.current) return
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                scheduleRetry("network")
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                try {
                  hlsRef.current?.recoverMediaError()
                } catch {
                  scheduleRetry("media")
                }
                break
              default:
                scheduleRetry("unknown-fatal")
            }
          }
        })

        hlsHandlersBoundRef.current = true
      }
    }

    const video = videoRef.current!
    if (hls.media !== video) {
      hls.attachMedia(video)
    }
    return hls
  }

  const loadSource = (sourceUrl = resolvedSrc) => {
    const s = typeof sourceUrl === "string" ? sourceUrl.trim() : ""
    if (!s) {
      setError("Video source missing.")
      setLoading(false)
      return
    }
    const video = videoRef.current
    if (!video) {
      setError("Video element not found.")
      setLoading(false)
      return
    }

    setLoading(true)

    if (!cleanupRef.current) {
      bindVideoListeners()
    }

    if (Hls.isSupported() && !isIOS) {
      const hls = ensureHls()
      if (!hls) return

      try {
        hls.stopLoad()
        hls.loadSource(s)
        hls.startLoad(-1)
        setRetryCount(0)
        tryAutoPlay(true)
      } catch {
        scheduleRetry("setup")
      }
      return
    }

    try {
      video.src = s
      setRetryCount(0)
      tryAutoPlay(true)
    } catch {
      scheduleRetry("native-setup")
    }
  }

  useEffect(() => {
    clearRetryTimeout()
    setRetryCount(0)
    setError(null)
    setLoading(true)
    loadSource(resolvedSrc)
    return () => {
      clearRetryTimeout()
    }
  }, [resolvedSrc])

  useEffect(() => {
    const fsHandler = () => showControls(true)
    document.addEventListener("fullscreenchange", fsHandler)
    return () => document.removeEventListener("fullscreenchange", fsHandler)
  }, [showControls])

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current)
      try {
        hlsRef.current?.destroy()
      } catch {}
      sendHistory()
    }
  }, [sendHistory])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video
        .play()
        .then(() => {
          autoplayAttemptsRef.current = 0
          setIsPlaying(true)
          if (!firstPlaybackDoneRef.current) firstPlaybackDoneRef.current = true
          if (progressTimerRef.current) clearInterval(progressTimerRef.current)
          progressTimerRef.current = setInterval(sendHistory, 5000)
          showControls(true)
        })
        .catch(() => setError("Playback failed. Please try again."))
    } else {
      video.pause()
      setIsPlaying(false)
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
      showControls(false)
      sendHistory()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    const nextMuted = !video.muted
    video.muted = nextMuted
    setIsMuted(nextMuted)
    showControls(true)
  }

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const v = Number.parseFloat(e.target.value)
    const shouldMute = v === 0
    video.volume = v
    video.muted = shouldMute
    setVolume(v)
    setIsMuted(shouldMute)
    showControls(true)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const t = Number.parseFloat(e.target.value)
    video.currentTime = t
    setCurrentTime(t)
    showControls(true)
  }

  const skip = useCallback(
    (seconds: number) => {
      const video = videoRef.current
      if (!video || !duration) return
      const next = Math.max(0, Math.min(duration, video.currentTime + seconds))
      video.currentTime = next
      setCurrentTime(next)
      showControls(true)
    },
    [duration, showControls],
  )

  const changeQuality = (level: number) => {
    if (!hlsRef.current) return
    hlsRef.current.currentLevel = level
    setCurrentLevel(level)
    showControls(true)
  }

  const toggleFullscreen = () => {
    const el = outerRef.current
    const video = videoRef.current as any
    if (!el || !video) return

    if (isIOS && typeof video.webkitEnterFullscreen === "function") {
      try {
        video.webkitEnterFullscreen()
        showControls(true)
      } catch {}
      return
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      el.requestFullscreen?.().catch(() => {})
    }
    showControls(true)
  }

  const clearSingleTapTimeout = () => {
    if (singleTapTimeoutRef.current) {
      clearTimeout(singleTapTimeoutRef.current)
      singleTapTimeoutRef.current = null
    }
  }

  const handleSkipGesture = useCallback(
    (clientX: number, rect: DOMRect) => {
      if (!rect.width) return
      const isLeft = clientX - rect.left < rect.width / 2
      const direction: "left" | "right" = isLeft ? "left" : "right"
      const skipAmount = isLeft ? -10 : 10

      // Show visual feedback
      const feedbackKey = Date.now().toString()
      setSkipFeedback({ direction, key: feedbackKey })
      setTimeout(() => {
        setSkipFeedback((prev) => (prev?.key === feedbackKey ? null : prev))
      }, 400)

      skip(skipAmount)
    },
    [skip],
  )

  const handleVideoPointerUp = (e: React.PointerEvent<HTMLVideoElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    const now = Date.now()
    const rect = e.currentTarget.getBoundingClientRect()
    const last = lastPointerRef.current
    const pointerType = e.pointerType || "mouse"

    const DOUBLE_TAP = 280
    const SINGLE_DELAY = 180
    const isDouble = last && now - last.time < DOUBLE_TAP && last.pointerType === pointerType

    if (isDouble) {
      clearSingleTapTimeout()
      lastPointerRef.current = null
      handleSkipGesture(e.clientX, rect)
    } else {
      lastPointerRef.current = { time: now, pointerType }
      clearSingleTapTimeout()
      singleTapTimeoutRef.current = setTimeout(() => {
        showControls(true)
        singleTapTimeoutRef.current = null
        lastPointerRef.current = null
      }, SINGLE_DELAY)
    }

    if (pointerType === "touch") e.preventDefault()
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        skip(-10)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        skip(10)
      }
    }

    const el = outerRef.current
    if (el) {
      el.addEventListener("keydown", handleKeyPress)
      return () => el.removeEventListener("keydown", handleKeyPress)
    }
  }, [skip])

  const onPointerMoveStage = () => showControls(true)
  const onTouchStartStage = () => showControls(true)
  const onMouseLeaveStage = () => {
    if (isPlaying) setControlsVisible(false)
  }

  const volumePercent = isMuted ? 0 : volume * 100

  return (
    <div
      ref={outerRef}
      className={`relative w-full select-none ${className}`}
      role="region"
      aria-label={title}
      tabIndex={0}
    >
      {/* Stage */}
      <div
        className="relative w-full bg-black overflow-hidden rounded-xl shadow-2xl aspect-video sm:aspect-[16/9] sm:max-h-[80vh]"
        style={{ minHeight: "clamp(200px, 40vh, 420px)" }}
        onPointerMove={onPointerMoveStage}
        onTouchStart={onTouchStartStage}
        onMouseLeave={onMouseLeaveStage}
      >
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-white/15" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neutral-400 animate-spin" />
            </div>
          </div>
        )}

        {error && retryCount >= MAX_RETRIES && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
            <div className="rounded-lg bg-neutral-800 p-6 text-center">
              <p className="mb-4 text-lg text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setRetryCount(0)
                  setLoading(true)
                  loadSource()
                }}
                className="rounded-full bg-neutral-700 px-6 py-2 text-white transition-colors hover:bg-neutral-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {skipFeedback && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div
              className={`text-6xl font-bold text-white/80 animate-pulse ${
                skipFeedback.direction === "left" ? "mr-20" : "ml-20"
              }`}
            >
              {skipFeedback.direction === "left" ? "⏪ 10" : "⏩ 10+"}
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          poster={poster}
          className={`absolute inset-0 h-full w-full transition-opacity duration-150 ${
            isPlaying ? "object-cover" : "object-contain"
          }`}
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          autoPlay
          muted={isMuted}
          preload="auto"
          crossOrigin="anonymous"
          onPointerUp={handleVideoPointerUp}
          onPlay={() => {
            autoplayAttemptsRef.current = 0
            setIsPlaying(true)
            if (!firstPlaybackDoneRef.current) firstPlaybackDoneRef.current = true
            if (progressTimerRef.current) clearInterval(progressTimerRef.current)
            progressTimerRef.current = setInterval(sendHistory, 5000)
            showControls(true)
          }}
          onPause={() => {
            setIsPlaying(false)
            if (progressTimerRef.current) {
              clearInterval(progressTimerRef.current)
              progressTimerRef.current = null
            }
            showControls(false)
            sendHistory()
          }}
          onEnded={() => {
            setIsPlaying(false)
            if (progressTimerRef.current) {
              clearInterval(progressTimerRef.current)
              progressTimerRef.current = null
            }
            showControls(false)
            sendHistory()
          }}
          style={{ touchAction: "manipulation", backgroundColor: "black" }}
          aria-label="Video content"
        >
          Your browser does not support the video tag.
        </video>

        {/* Controls */}
        <div
          className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 md:px-3 lg:px-4 pb-2.5 pt-5 transition-opacity duration-300 ${
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          role="toolbar"
          aria-label="Video controls"
        >
          <div className="flex flex-nowrap items-center gap-1 sm:gap-2 lg:gap-3 text-white text-[11px] sm:text-sm overflow-x-auto">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8z" />
                </svg>
              )}
            </button>

            <span className="hidden sm:block font-mono tabular-nums whitespace-nowrap text-xs sm:text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Progress */}
            <div className="flex min-w-[80px] sm:min-w-[120px] flex-1 items-center">
              <div className="relative h-1.5 w-full rounded-full bg-white/20">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-neutral-300 transition-all duration-300 ease-linear"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step="any"
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Video progress"
                />
              </div>
            </div>

            {/* Volume */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white transition hover:text-neutral-300"
                aria-label={isMuted || volume === 0 ? "Unmute video" : "Mute video"}
              >
                {isMuted || volume === 0 ? (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586l4.586-4.586a2 2 0 012.828 0M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586L8 6.586A2 2 0 019.414 6H11"
                    />
                  </svg>
                )}
              </button>
              <div className="relative h-1.5 w-16 sm:w-24 rounded-full bg-white/20">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-neutral-300 transition-all duration-200"
                  style={{ width: `${volumePercent}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={handleVolumeSliderChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Volume control"
                />
              </div>
            </div>

            {levels.length > 0 && (
              <select
                value={currentLevel}
                onChange={(e) => changeQuality(Number.parseInt(e.target.value, 10))}
                className="shrink-0 h-8 sm:h-9 px-1.5 sm:px-2 text-[10px] sm:text-sm rounded-md border border-white/20 bg-transparent text-white/90 focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer"
                aria-label="Select video quality"
              >
                <option value="-1" className="bg-neutral-900">
                  Auto
                </option>
                {levels.map((level, index) => (
                  <option key={index} value={index} className="bg-neutral-900">
                    {qualityLabels[level.height] || `${level.height}p`}
                  </option>
                ))}
              </select>
            )}

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="ml-auto flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              aria-label="Toggle fullscreen"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
