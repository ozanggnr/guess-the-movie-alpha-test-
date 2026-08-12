import { useEffect, useRef, useState, useCallback } from 'react'
import { useYouTubePlayer } from '../hooks/useYouTubePlayer'
import { twMerge } from 'tailwind-merge'

interface YouTubeTrailerPlayerProps {
  videoId: string
  /** Reveal window in seconds (1, 3, 5, 10) */
  duration: number
  /** Full trailer length in seconds */
  trailerDuration: number | null
  isPlaying: boolean
  onFinished: () => void
  onError: (error: unknown) => void
  className?: string
}

const SCRUB_INTERVAL_MS = 120 // seek every 120ms — smooth without hammering the API

export function YouTubeTrailerPlayer({
  videoId,
  duration,
  trailerDuration,
  isPlaying,
  onFinished,
  onError,
  className,
}: YouTubeTrailerPlayerProps) {
  const { containerRef, isReady, error, playVideo, pauseVideo, seekTo } =
    useYouTubePlayer({ videoId, onError })

  const [wallElapsed, setWallElapsed] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const durationRef = useRef(duration)
  const trailerDurationRef = useRef(trailerDuration)
  const onFinishedRef = useRef(onFinished)

  useEffect(() => { durationRef.current = duration }, [duration])
  useEffect(() => { trailerDurationRef.current = trailerDuration }, [trailerDuration])
  useEffect(() => { onFinishedRef.current = onFinished }, [onFinished])

  // Speed multiplier for display only (actual scrubbing handles the seek)
  const speedMult = trailerDuration && trailerDuration > 0
    ? (trailerDuration / duration).toFixed(1)
    : '1.0'

  const stopScrubbing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    setIsActive(false)
  }, [])

  const startScrubbing = useCallback(() => {
    stopScrubbing()

    // Seek to beginning and start playing
    seekTo(0, true)
    playVideo()

    startTimeRef.current = Date.now()
    setWallElapsed(0)
    setIsActive(true)

    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return

      const elapsed = (Date.now() - startTimeRef.current) / 1000
      setWallElapsed(elapsed)

      const totalDuration = durationRef.current
      const trailer = trailerDurationRef.current

      if (elapsed >= totalDuration) {
        stopScrubbing()
        pauseVideo()
        onFinishedRef.current()
        return
      }

      // Where in the video we should be right now
      const targetVideoPos = trailer && trailer > 0
        ? (elapsed / totalDuration) * trailer
        : elapsed

      seekTo(targetVideoPos, true)
    }, SCRUB_INTERVAL_MS)
  }, [seekTo, playVideo, pauseVideo, stopScrubbing])

  // React to isPlaying changes
  useEffect(() => {
    if (!isReady) return

    if (isPlaying) {
      startScrubbing()
    } else {
      stopScrubbing()
      pauseVideo()
      setWallElapsed(0)
    }

    return () => stopScrubbing()
  }, [isPlaying, isReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const progressPercent = Math.min((wallElapsed / duration) * 100, 100)
  const showLoading = !isReady && !error
  const showCurtain = !isActive || !isReady // hide YouTube UI when not scrubbing

  return (
    <div
      className={twMerge(
        'relative w-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl',
        className
      )}
      style={{ aspectRatio: '16/9' }}
    >
      {/* YouTube iframe wrapper — upscaled & cropped so top title bar & bottom YouTube logo are hidden */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[125%] h-[125%] shrink-0 flex items-center justify-center scale-110">
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>

      {/* Black curtain — covers YouTube branding/title when NOT scrubbing */}
      <div
        className="absolute inset-0 z-10 bg-black transition-opacity duration-300 pointer-events-none"
        style={{ opacity: showCurtain ? 1 : 0 }}
      />

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black p-4 text-center">
          <div className="text-4xl mb-3">🎬</div>
          <p className="text-white font-semibold">Video Unavailable</p>
          <p className="text-white/50 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading spinner — shown on curtain */}
      {!error && showLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      )}

      {/* Speed badge — shown while scrubbing */}
      {!error && isActive && (
        <div className="absolute top-2 right-2 z-20 pointer-events-none">
          <span className="bg-black/70 text-cyan-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/30">
            {speedMult}× speed
          </span>
        </div>
      )}

      {/* Timer — shown while scrubbing */}
      {!error && isActive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/70 text-white px-3 py-0.5 rounded-full text-xs font-mono border border-white/20">
            <span className="text-cyan-400">{wallElapsed.toFixed(1)}</span>
            <span className="text-white/40"> / {duration}s</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-20">
        <div
          className="h-full bg-cyan-400"
          style={{ width: `${progressPercent}%`, transition: 'width 0.1s linear' }}
        />
      </div>
    </div>
  )
}
