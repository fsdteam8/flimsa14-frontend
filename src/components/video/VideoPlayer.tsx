'use client';

import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster = '',
  title = 'Video Player',
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [levels, setLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 for Auto
  const [volume, setVolume] = useState(1);

  // Available quality levels
  const qualityLabels: { [key: number]: string } = {
    '-1': 'Auto',
    360: '360p',
    480: '480p',
    720: '720p',
    1080: '1080p',
  };

  // Format time helper
  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  // HLS Setup with Enhanced Error Handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      setError('Video element not found.');
      setLoading(false);
      return;
    }

    // Update state on video events
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleError = () => {
      setError('Failed to load video. Please try again.');
      setLoading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        startLevel: -1, // Start with Auto
        autoStartLoad: true,
      });
      hlsRef.current = hls;

      try {
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          // Filter levels to only include 360p, 480p, 720p, 1080p

          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const filteredLevels = data.levels.filter((level: any) =>
            [360, 480, 720, 1080].includes(level.height)
          );
          setLevels(filteredLevels);
          setCurrentLevel(-1); // Default to Auto
          setLoading(false);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          setCurrentLevel(data.level);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          let errorMessage = 'An error occurred while loading the video.';
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                errorMessage = 'Network error. Please check your connection and try again.';
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                errorMessage = 'Media error. The video format may be unsupported.';
                break;
              default:
                errorMessage = 'An unexpected error occurred.';
            }
            hls.destroy();
            hlsRef.current = null;
          }
          setError(errorMessage);
          setLoading(false);
        });
      } catch (err) {
        console.error('HLS Setup Error:', err);
        setError('Failed to initialize video player.');
        setLoading(false);
      }

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('volumechange', handleVolumeChange);
        video.removeEventListener('error', handleError);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (e.g., Safari)
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        // Native HLS doesn't provide quality levels, so disable quality selector
        setLevels([]);
      });
      video.addEventListener('error', () => {
        setError('Failed to load video in this browser.');
        setLoading(false);
      });
    } else {
      setError('Your browser does not support HLS playback.');
      setLoading(false);
    }
  }, [src]);

  // Play/Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setError('Playback failed. Please try again.'));
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error('Play/Pause Error:', err);
      setError('Unable to control playback.');
    }
  };

  // Mute/Unmute Toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.muted = !videoRef.current.muted;
    } catch (err) {
      console.error('Mute Error:', err);
      setError('Unable to control volume.');
    }
  };

  // Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    try {
      const newVol = parseFloat(e.target.value);
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    } catch (err) {
      console.error('Volume Change Error:', err);
      setError('Unable to adjust volume.');
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    try {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
    } catch (err) {
      console.error('Seek Error:', err);
      setError('Unable to seek video.');
    }
  };

  // Skip Forward/Backward
  const skip = (seconds: number) => {
    if (!videoRef.current || !duration) return;
    try {
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
    } catch (err) {
      console.error('Skip Error:', err);
      setError('Unable to skip video.');
    }
  };

  // Quality Change
  const changeQuality = (level: number) => {
    if (!hlsRef.current) return;
    try {
      hlsRef.current.currentLevel = level;
      setCurrentLevel(level);
    } catch (err) {
      console.error('Quality Change Error:', err);
      setError('Unable to change video quality.');
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen Error:', err);
      setError('Unable to toggle fullscreen.');
    }
  };

  // Calculate progress and volume percentages
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-5xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl group ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        className="w-full aspect-video object-cover"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label="Video content"
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom Progress Bar */}
      <div className="absolute bottom-20 left-4 right-4 z-10">
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration}
            step="any"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Video progress"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-300 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
        role="toolbar"
        aria-label="Video controls"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
            <button
              onClick={() => skip(-10)}
              className="p-2 text-white hover:text-blue-400"
              aria-label="Skip backward 10 seconds"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={togglePlay}
              className="p-3 text-white hover:text-blue-400"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => skip(10)}
              className="p-2 text-white hover:text-blue-400"
              aria-label="Skip forward 10 seconds"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Volume Control */}
            <button
              onClick={toggleMute}
              className="text-white hover:text-blue-400"
              aria-label={isMuted || volume === 0 ? 'Unmute video' : 'Mute video'}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586l4.586-4.586a2 2 0 012.828 0M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586L8 6.586A2 2 0 019.414 6H11"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586L8 6.586A2 2 0 019.414 6H11"
                  />
                </svg>
              )}
            </button>
            <div className="relative w-20 h-2 bg-gray-700 rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-200"
                style={{ width: `${volumePercent}%` }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Volume control"
              />
            </div>

            {/* Quality Selector */}
            {levels.length > 0 && (
              <select
                value={currentLevel}
                onChange={(e) => changeQuality(parseInt(e.target.value))}
                className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-black/90 transition-colors cursor-pointer"
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

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:text-blue-400"
              aria-label="Toggle fullscreen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
};

export default VideoPlayer;



















// 'use client';

// import React, { useRef, useEffect, useState } from 'react';
// import Hls from 'hls.js';

// interface VideoPlayerProps {
//   src: string;
//   poster?: string;
//   title?: string; // Optional video title for accessibility
//   className?: string;
// }

// const VideoPlayer: React.FC<VideoPlayerProps> = ({
//   src,
//   poster = '',
//   title = 'Video Player',
//   className = '',
// }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);

//   // HLS Setup
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     if (Hls.isSupported()) {
//       const hls = new Hls({
//         enableWorker: true,
//         lowLatencyMode: true,
//         backBufferLength: 90,
//       });

//       hls.loadSource(src);
//       hls.attachMedia(video);

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         setLoading(false);
//       });

//       hls.on(Hls.Events.ERROR, (event, data) => {
//         console.error('HLS Error:', data);
//         setError('Failed to load video. Please check your connection or try again.');
//         setLoading(false);
//       });

//       return () => {
//         hls.destroy();
//       };
//     } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
//       video.src = src;
//       video.addEventListener('loadedmetadata', () => setLoading(false));
//       video.addEventListener('error', () => {
//         setError('Video format not supported by your browser.');
//         setLoading(false);
//       });
//     } else {
//       setError('Your browser does not support HLS playback.');
//       setLoading(false);
//     }
//   }, [src]);

//   // Play/Pause Toggle
//   const togglePlay = () => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play().catch(() => setError('Playback failed. Please try again.'));
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   // Mute/Unmute Toggle
//   const toggleMute = () => {
//     if (videoRef.current) {
//       videoRef.current.muted = !isMuted;
//       setIsMuted(!isMuted);
//     }
//   };

//   // Fullscreen Toggle
//   const toggleFullscreen = () => {
//     if (containerRef.current) {
//       if (document.fullscreenElement) {
//         document.exitFullscreen();
//       } else {
//         containerRef.current.requestFullscreen().catch((err) => console.error('Fullscreen error:', err));
//       }
//     }
//   };

//   return (
//     <div
//       ref={containerRef}
//       className={`relative w-full max-w-5xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl group ${className}`}
//       role="region"
//       aria-label={title}
//     >
//       {/* Loading Overlay */}
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20 transition-opacity">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
//         </div>
//       )}

//       {/* Error Overlay */}
//       {error && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
//           <div className="text-center p-6 bg-gray-800 rounded-lg">
//             <p className="text-red-400 text-lg mb-4">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full transition-colors"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Video Element */}
//       <video
//         ref={videoRef}
//         poster={poster}
//         className="w-full aspect-video object-cover"
//         onClick={togglePlay}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         aria-label="Video content"
//       >
//         Your browser does not support the video tag.
//       </video>

//       {/* Custom Controls (Always Visible on Hover/Tap) */}
//       <div
//         className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//         role="toolbar"
//         aria-label="Video controls"
//       >
//         {/* Play/Pause Button */}
//         <button
//           onClick={togglePlay}
//           className="text-white hover:text-blue-400 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
//           aria-label={isPlaying ? 'Pause video' : 'Play video'}
//         >
//           {isPlaying ? (
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
//             </svg>
//           ) : (
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8z" />
//             </svg>
//           )}
//         </button>

//         {/* Mute/Unmute Button */}
//         <button
//           onClick={toggleMute}
//           className="text-white hover:text-blue-400 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
//           aria-label={isMuted ? 'Unmute video' : 'Mute video'}
//         >
//           {isMuted ? (
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586L8 6.586A2 2 0 019.414 6H11m-6 6h6m6 0l-3-3m0 3l3-3" />
//             </svg>
//           ) : (
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H3a1 1 0 01-1-1V10a1 1 0 011-1h2.586L8 6.586A2 2 0 019.414 6H11" />
//             </svg>
//           )}
//         </button>

//         {/* Fullscreen Button */}
//         <button
//           onClick={toggleFullscreen}
//           className="text-white hover:text-blue-400 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
//           aria-label="Toggle fullscreen"
//         >
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
//             />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default VideoPlayer;