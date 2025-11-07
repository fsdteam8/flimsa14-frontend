"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { useSession } from "next-auth/react";

interface VideoPlayerProps {
  src?: string;
  videoUrl?: string;
  poster?: string;
  title?: string;
  className?: string;
  movieId: string;
}

const qualityLabels: Record<string | number, string> = {
  "-1": "Auto",
  360: "360p",
  480: "480p",
  720: "720p",
  1080: "1080p",
};

const MAX_RETRIES = 4;

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  videoUrl,
  className = "",
  poster = "/placeholder.svg?height=300&width=500",
  title = "Video Player",
  movieId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSourceRef = useRef("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerRef = useRef<{ time: number; pointerType: string } | null>(null);
  const hideUiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const resolvedSrc = useMemo(() => {
    if (typeof src === "string" && src.trim()) return src.trim();
    if (typeof videoUrl === "string" && videoUrl.trim()) return videoUrl.trim();
    return "";
  }, [src, videoUrl]);

  latestSourceRef.current = resolvedSrc;

  // UI state
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // ✨ start unmuted
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [levels, setLevels] = useState<Array<{ height: number }>>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [volume, setVolume] = useState(1);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [gestureRequired, setGestureRequired] = useState(false); // when autoplay with sound is blocked

  const formatTime = (sec: number) => {
    if (Number.isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  // Attempt to play with sound; if blocked by policy, require user gesture
  const tryPlayWithSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false; // ensure sound
    setIsMuted(false);
    try {
      await video.play();
      setIsPlaying(true);
      setGestureRequired(false);
    } catch {
      // Browser blocked autoplay with sound
      setIsPlaying(false);
      setGestureRequired(true);
      setControlsVisible(true);
    }
  };

  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const registerCleanup = (fn: () => void) => {
    const wrapped = () => {
      fn();
      if (cleanupRef.current === wrapped) cleanupRef.current = null;
    };
    cleanupRef.current = wrapped;
    return wrapped;
  };

  const runCleanup = () => {
    if (cleanupRef.current) cleanupRef.current();
  };

  // Quiet backoff retries with spinner
  const scheduleRetry = () => {
    clearRetryTimeout();
    setRetryCount((prev) => {
      if (prev >= MAX_RETRIES) {
        setFatalError("Playback failed. Please try again.");
        setLoading(false);
        return prev;
      }
      const next = prev + 1;
      const delay = Math.min(1000 * 2 ** (next - 1), 8000);
      setLoading(true);
      retryTimeoutRef.current = setTimeout(() => {
        setFatalError(null);
        runCleanup();
        initHls(latestSourceRef.current);
      }, delay);
      return next;
    });
  };

  const sendHistory = useCallback(() => {
    if (!videoRef.current || !duration || !movieId || !token) return;
    const progress = Math.round((videoRef.current.currentTime / duration) * 100);

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId, progress }),
    }).catch(() => {
      // Silent fail
    });
  }, [duration, movieId, token]);

  const initHls = (sourceUrl = resolvedSrc) => {
    const sanitizedSrc = typeof sourceUrl === "string" ? sourceUrl.trim() : "";
    if (!sanitizedSrc) {
      setFatalError("Video source missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setFatalError(null);
    setGestureRequired(false);

    const video = videoRef.current;
    if (!video) {
      setFatalError("Video element not found.");
      setLoading(false);
      return;
    }

    // Reset element state
    video.muted = false; // start unmuted
    setIsMuted(false);

    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };
    const handleCanPlay = () => {
      setLoading(false);
      // Try to start with sound; if blocked, show big play overlay
      tryPlayWithSound();
    };
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleVideoError = () => scheduleRetry();

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("error", handleVideoError);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        startLevel: -1,
        autoStartLoad: true,
        capLevelToPlayerSize: true,
      });
      hlsRef.current = hls;

      try {
        hls.attachMedia(video);
        hls.loadSource(sanitizedSrc);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const filtered = data.levels.filter((level: { height: number }) =>
            [360, 480, 720, 1080].includes(level.height)
          );
          setLevels(filtered);
          setCurrentLevel(-1);
          setLoading(false);
          setRetryCount(0);
          // If metadata already fired, this won't hurt
          tryPlayWithSound();
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          setCurrentLevel(data.level);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!hlsRef.current) return;
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                scheduleRetry();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                try {
                  hlsRef.current?.recoverMediaError();
                } catch {
                  scheduleRetry();
                }
                break;
              default:
                scheduleRetry();
            }
          }
        });
      } catch {
        scheduleRetry();
      }

      return registerCleanup(() => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("volumechange", handleVolumeChange);
        video.removeEventListener("error", handleVideoError);
        if (hlsRef.current) {
          try {
            hlsRef.current.destroy();
          } catch {}
          hlsRef.current = null;
        }
      });
    }

    // iOS Safari native HLS
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sanitizedSrc;
      const onLoadedMetadata = () => {
        setLoading(false);
        setLevels([]);
        setRetryCount(0);
        tryPlayWithSound();
      };
      const onError = () => scheduleRetry();
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("error", onError);

      return registerCleanup(() => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("volumechange", handleVolumeChange);
        video.removeEventListener("error", handleVideoError);
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("error", onError);
      });
    }

    setFatalError("Your browser does not support HLS playback.");
    setRetryCount(MAX_RETRIES);
    setLoading(false);
    return registerCleanup(() => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("error", handleVideoError);
    });
  };

  // Init / source change
  useEffect(() => {
    clearRetryTimeout();
    setRetryCount(0);
    setFatalError(null);
    setLoading(true);
    const cleanup = initHls(resolvedSrc);
    return () => {
      clearRetryTimeout();
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedSrc]);

  // Tear down history interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      sendHistory();
    };
  }, [sendHistory]);

  // Controls auto-hide (3s when playing)
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideUiTimerRef.current) clearTimeout(hideUiTimerRef.current);
    if (isPlaying && !loading) {
      hideUiTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  }, [isPlaying, loading]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onActivity = () => showControls();
    const onFsChange = () => showControls();

    el.addEventListener("mousemove", onActivity);
    el.addEventListener("pointermove", onActivity);
    el.addEventListener("touchstart", onActivity, { passive: true });
    el.addEventListener("click", onActivity);
    document.addEventListener("keydown", onActivity);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      el.removeEventListener("mousemove", onActivity);
      el.removeEventListener("pointermove", onActivity);
      el.removeEventListener("touchstart", onActivity);
      el.removeEventListener("click", onActivity);
      document.removeEventListener("keydown", onActivity);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [showControls]);

  useEffect(() => {
    // When play state changes, reset auto-hide logic
    showControls();
  }, [isPlaying, showControls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setGestureRequired(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(sendHistory, 5000);
          showControls();
        })
        .catch(() => {
          // Keep overlay; user may need to tap the big play
          setGestureRequired(true);
          setIsPlaying(false);
          showControls();
        });
    } else {
      video.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      sendHistory();
      showControls();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    showControls();
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVol = Number.parseFloat(e.target.value);
    video.volume = newVol;
    // Only mute if volume is exactly 0; otherwise never flip mute on seek/drag
    const shouldMute = newVol === 0;
    video.muted = shouldMute;
    setVolume(newVol);
    setIsMuted(shouldMute);
    showControls();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Number.parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
    // ❗ Never touch mute here
    showControls();
  };

  const skip = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video || !duration) return;
      const nextTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
      showControls();
    },
    [duration, showControls]
  );

  const changeQuality = (level: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = level;
    setCurrentLevel(level);
    showControls();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    showControls();
  };

  // Gestures: single tap toggles play, double tap skips ±10s
  const clearSingleTapTimeout = () => {
    if (singleTapTimeoutRef.current) {
      clearTimeout(singleTapTimeoutRef.current);
      singleTapTimeoutRef.current = null;
    }
  };

  const handleVideoPointerUp = (event: React.PointerEvent<HTMLVideoElement>) => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (event.pointerType === "mouse" && (event as any).button !== 0) return;
    const now = Date.now();
    const rect = event.currentTarget.getBoundingClientRect();
    const last = lastPointerRef.current;
    const pointerType = event.pointerType || "mouse";

    const DOUBLE_TAP_THRESHOLD = 280;
    const SINGLE_TAP_DELAY = 180;
    const isDoubleTap =
      last && now - last.time < DOUBLE_TAP_THRESHOLD && last.pointerType === pointerType;

    if (isDoubleTap) {
      clearSingleTapTimeout();
      lastPointerRef.current = null;
      const isLeftHalf = event.clientX - rect.left < rect.width / 2;
      skip(isLeftHalf ? -10 : 10);
    } else {
      lastPointerRef.current = { time: now, pointerType };
      clearSingleTapTimeout();
      singleTapTimeoutRef.current = setTimeout(() => {
        togglePlay();
        singleTapTimeoutRef.current = null;
        lastPointerRef.current = null;
      }, SINGLE_TAP_DELAY);
    }

    if (pointerType === "touch") {
      event.preventDefault();
    }
    showControls();
  };

  useEffect(() => {
    return () => {
      clearSingleTapTimeout();
      if (hideUiTimerRef.current) clearTimeout(hideUiTimerRef.current);
    };
  }, []);

  // const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;
  const hideCursor = isPlaying && !loading && !controlsVisible;

  return (
    <div
      ref={containerRef}
      className={`video-container relative w-full max-w-5xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl ${className} ${
        hideCursor ? "cursor-none" : ""
      }`}
      role="region"
      aria-label={title}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/60 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3">
            <div className="spinner-ring" aria-label="Loading" />
            <span className="text-white/80 text-sm">Loading…</span>
          </div>
        </div>
      )}

      {/* Fatal error only after backoff */}
      {fatalError && retryCount >= MAX_RETRIES && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/80">
          <div className="rounded-lg bg-gray-800/80 p-4 text-center w-11/12 max-w-sm">
            <p className="mb-3 text-base text-white/90">{fatalError}</p>
            <button
              type="button"
              onClick={() => {
                setFatalError(null);
                setRetryCount(0);
                setLoading(true);
                initHls();
              }}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium active:scale-[0.99] transition-colors hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Big play overlay if browser requires gesture for sound */}
      {gestureRequired && !loading && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-20 grid place-items-center bg-black/30 focus-visible:outline-none"
          aria-label="Play video"
        >
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-md">
            <svg className="h-9 w-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        poster={poster}
        className={`aspect-video w-full object-cover transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        playsInline
        // We still leave autoPlay attribute; browser will ignore if blocked.
        autoPlay
        muted={isMuted}
        preload="auto"
        crossOrigin="anonymous"
        onPointerUp={handleVideoPointerUp}
        onPlay={() => {
          setIsPlaying(true);
          setGestureRequired(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(sendHistory, 5000);
          showControls();
        }}
        onPause={() => {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          sendHistory();
          setControlsVisible(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          sendHistory();
          setControlsVisible(true);
        }}
        style={{ touchAction: "manipulation" }}
        aria-label="Video content"
      >
        Your browser does not support the video tag.
      </video>

      {/* Controls overlay (visible also in fullscreen) */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-200 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 md:px-4 pt-16 pb-3">
          <div
            className="flex items-center gap-2 md:gap-3 text-white text-sm"
            role="toolbar"
            aria-label="Video controls"
          >
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8z" />
                </svg>
              )}
            </button>

            {/* Time */}
            <span className="font-mono text-xs md:text-sm tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Progress */}
            <div className="flex min-w-[120px] flex-1 items-center">
              <div className="relative h-2 w-full rounded-full bg-white/20">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-linear"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
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

            {/* Volume (hidden on xs) */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white transition hover:text-blue-400"
                aria-label={isMuted || volume === 0 ? "Unmute video" : "Mute video"}
              >
                {isMuted || volume === 0 ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586l4.586-4.586a2 2 0 012.828 0M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586L8 6.586A2 2 0 019.414 6H11"
                    />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586L8 6.586A2 2 0 019.414 6H11"
                    />
                  </svg>
                )}
              </button>
              <div className="relative h-2 w-24 md:w-32 rounded-full bg-white/20">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200"
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

            {/* Quality */}
            {levels.length > 0 && (
              <select
                value={currentLevel}
                onChange={(e) => changeQuality(Number.parseInt(e.target.value, 10))}
                className="min-w-[92px] shrink-0 cursor-pointer rounded-md border border-white/10 bg-black/60 px-3 py-2 text-xs md:text-sm text-white transition-colors hover:bg-black/80"
                aria-label="Select video quality"
              >
                <option value="-1">{qualityLabels[-1]}</option>
                {levels.map((level, index) => (
                  <option key={index} value={index}>
                    {qualityLabels[level.height] || `${level.height}p`}
                  </option>
                ))}
              </select>
            )}

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Toggle fullscreen"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Fullscreen centering & spinner styles */}
      <style jsx global>{`
        /* Center video when container is fullscreen */
        .video-container:fullscreen,
        .video-container:-webkit-full-screen {
          background: #000;
        }
        .video-container:fullscreen video,
        .video-container:-webkit-full-screen video {
          width: 100vw;
          height: 100vh;
          object-fit: contain;
          display: block;
        }

        /* Clean ring spinner */
        .spinner-ring {
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          border: 3px solid rgba(255, 255, 255, 0.18);
          border-top-color: rgb(59, 130, 246);
          animation: spin-rotate 1s linear infinite;
        }
        @keyframes spin-rotate {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
