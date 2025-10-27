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
const AUTOPLAY_MAX_ATTEMPTS = 3;

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
  const autoplayAttemptsRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerRef = useRef<{ time: number; pointerType: string } | null>(null);

  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const resolvedSrc = useMemo(() => {
    if (typeof src === "string" && src.trim()) return src.trim();
    if (typeof videoUrl === "string" && videoUrl.trim()) return videoUrl.trim();
    return "";
  }, [src, videoUrl]);

  latestSourceRef.current = resolvedSrc;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [levels, setLevels] = useState<Array<{ height: number }>>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [volume, setVolume] = useState(1);

  const formatTime = (sec: number) => {
    if (Number.isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  const tryAutoPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.autoplay = true;
    setIsMuted(true);

    if (!video.paused) return;
    if (autoplayAttemptsRef.current >= AUTOPLAY_MAX_ATTEMPTS) return;

    autoplayAttemptsRef.current += 1;

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch((err) => {
        console.warn("Autoplay blocked or failed:", err);
        if (autoplayAttemptsRef.current < AUTOPLAY_MAX_ATTEMPTS) {
          setTimeout(() => {
            tryAutoPlay();
          }, 500);
        }
      });
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
      if (cleanupRef.current === wrapped) {
        cleanupRef.current = null;
      }
    };
    cleanupRef.current = wrapped;
    return wrapped;
  };

  const runCleanup = () => {
    if (cleanupRef.current) cleanupRef.current();
  };

  const scheduleRetry = (reason: string) => {
    clearRetryTimeout();
    setRetryCount((prev) => {
      if (prev >= MAX_RETRIES) {
        setError("An error occurred while loading the video.");
        setLoading(false);
        return prev;
      }
      const next = prev + 1;
      const delay = Math.min(1000 * 2 ** (next - 1), 10000);
      setLoading(true);
      console.warn(`Retrying video init (#${next}) in ${delay}ms due to: ${reason}`);
      retryTimeoutRef.current = setTimeout(() => {
        setError(null);
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
    }).catch((err) => console.error("History update failed:", err));
  }, [duration, movieId, token]);

  const initHls = (sourceUrl = resolvedSrc) => {
    const sanitizedSrc = typeof sourceUrl === "string" ? sourceUrl.trim() : "";
    if (!sanitizedSrc) {
      setError("Video source missing.");
      setLoading(false);
      return;
    }

    autoplayAttemptsRef.current = 0;

    const video = videoRef.current;
    if (!video) {
      setError("Video element not found.");
      setLoading(false);
      return;
    }

    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {
        // ignore cleanup failures
      }
      hlsRef.current = null;
    }

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };
    const handleCanPlay = () => {
      setLoading(false);
      tryAutoPlay();
    };
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleVideoError = () => scheduleRetry("video-error");

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
          tryAutoPlay();
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          setCurrentLevel(data.level);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error("HLS Error:", data);
          if (!hlsRef.current) return;

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                scheduleRetry("network");
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                try {
                  hlsRef.current?.recoverMediaError();
                } catch {
                  scheduleRetry("media");
                }
                break;
              default:
                scheduleRetry("unknown-fatal");
            }
          }
        });
      } catch (err) {
        console.error("HLS Setup Error:", err);
        scheduleRetry("setup");
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
          } catch {
            // ignore
          }
          hlsRef.current = null;
        }
      });
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sanitizedSrc;
      const onLoadedMetadata = () => {
        setLoading(false);
        setLevels([]);
        setRetryCount(0);
        tryAutoPlay();
      };
      const onError = () => scheduleRetry("native-hls-error");
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

    setError("Your browser does not support HLS playback.");
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

  useEffect(() => {
    clearRetryTimeout();
    setRetryCount(0);
    setError(null);
    setLoading(true);
    const cleanup = initHls(resolvedSrc);
    return () => {
      clearRetryTimeout();
      if (cleanup) cleanup();
    };
  }, [resolvedSrc]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      sendHistory();
    };
  }, [sendHistory]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) {
        video
          .play()
          .then(() => {
            autoplayAttemptsRef.current = 0;
            setIsPlaying(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(sendHistory, 5000);
          })
          .catch(() => setError("Playback failed. Please try again."));
      } else {
        video.pause();
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        sendHistory();
      }
    } catch (err) {
      console.error("Play/Pause Error:", err);
      setError("Unable to control playback.");
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const nextMuted = !video.muted;
      video.muted = nextMuted;
      setIsMuted(nextMuted);
    } catch (err) {
      console.error("Mute Error:", err);
      setError("Unable to control volume.");
    }
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const newVol = Number.parseFloat(e.target.value);
      const shouldMute = newVol === 0;
      video.volume = newVol;
      video.muted = shouldMute;
      setVolume(newVol);
      setIsMuted(shouldMute);
    } catch (err) {
      console.error("Volume Change Error:", err);
      setError("Unable to adjust volume.");
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const newTime = Number.parseFloat(e.target.value);
      video.currentTime = newTime;
    } catch (err) {
      console.error("Seek Error:", err);
      setError("Unable to seek video.");
    }
  };

  const skip = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video || !duration) return;
      const nextTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration]
  );

  const changeQuality = (level: number) => {
    if (!hlsRef.current) return;
    try {
      hlsRef.current.currentLevel = level;
      setCurrentLevel(level);
    } catch (err) {
      console.error("Quality Change Error:", err);
      setError("Unable to change video quality.");
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
          /* ignore */
        });
      } else {
        containerRef.current.requestFullscreen().catch(() => {
          /* ignore */
        });
      }
    } catch (err) {
      console.error("Fullscreen Error:", err);
      setError("Unable to toggle fullscreen.");
    }
  };

  const handleSkipGesture = useCallback(
    (clientX: number, rect: DOMRect) => {
      if (!rect.width) return;
      const isLeftHalf = clientX - rect.left < rect.width / 2;
      skip(isLeftHalf ? -10 : 10);
    },
    [skip]
  );

  const clearSingleTapTimeout = () => {
    if (singleTapTimeoutRef.current) {
      clearTimeout(singleTapTimeoutRef.current);
      singleTapTimeoutRef.current = null;
    }
  };

  const handleVideoPointerUp = (event: React.PointerEvent<HTMLVideoElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const now = Date.now();
    const rect = event.currentTarget.getBoundingClientRect();
    const last = lastPointerRef.current;
    const pointerType = event.pointerType || "mouse";

    const DOUBLE_TAP_THRESHOLD = 280;
    const SINGLE_TAP_DELAY = 180;
    const isDoubleTap = last && now - last.time < DOUBLE_TAP_THRESHOLD && last.pointerType === pointerType;

    if (isDoubleTap) {
      clearSingleTapTimeout();
      lastPointerRef.current = null;
      handleSkipGesture(event.clientX, rect);
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
  };

  useEffect(() => {
    return () => {
      clearSingleTapTimeout();
    };
  }, []);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-5xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl group ${className}`}
      role="region"
      aria-label={title}
    >
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-white/15" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          </div>
        </div>
      )}

      {error && retryCount >= MAX_RETRIES && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <div className="rounded-lg bg-gray-800 p-6 text-center">
            <p className="mb-4 text-lg text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setRetryCount(0);
                setLoading(true);
                initHls();
              }}
              className="rounded-full bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        poster={poster}
        className={`aspect-video w-full object-cover transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
        playsInline
        autoPlay
        muted={isMuted}
        preload="auto"
        crossOrigin="anonymous"
        onPointerUp={handleVideoPointerUp}
        onPlay={() => {
          autoplayAttemptsRef.current = 0;
          setIsPlaying(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(sendHistory, 5000);
        }}
        onPause={() => {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          sendHistory();
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          sendHistory();
        }}
        style={{ touchAction: "manipulation" }}
        aria-label="Video content"
      >
        Your browser does not support the video tag.
      </video>

      <div
        className="flex flex-wrap items-center gap-3 border-t border-white/10 bg-black/80 px-4 py-4 text-white text-xs sm:text-sm"
        role="toolbar"
        aria-label="Video controls"
      >
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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

        <span className="hidden font-mono text-[13px] tabular-nums sm:block sm:text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex min-w-[140px] flex-1 items-center">
          <div className="relative h-1.5 w-full rounded-full bg-white/20">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-linear"
              style={{ width: `${progressPercent}%` }}
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

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={toggleMute}
            className="text-white transition hover:text-blue-400"
            aria-label={isMuted || volume === 0 ? "Unmute video" : "Mute video"}
          >
            {isMuted || volume === 0 ? (
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586l4.586-4.586a2 2 0 012.828 0M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586L8 6.586A2 2 0 019.414 6H11"
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
          <div className="relative h-1.5 w-20 rounded-full bg-white/20 sm:w-28">
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

        {levels.length > 0 && (
          <select
            value={currentLevel}
            onChange={(e) => changeQuality(Number.parseInt(e.target.value, 10))}
            className="min-w-[90px] shrink-0 cursor-pointer rounded-md border border-white/10 bg-black/60 px-3 py-1 text-xs text-white transition-colors hover:bg-black/80 sm:text-sm"
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

        <button
          type="button"
          onClick={toggleFullscreen}
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
  );
};

export default VideoPlayer;
