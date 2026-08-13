import { useEffect, useRef, useState, useCallback } from 'react'
import { useYouTubePlayer } from '../hooks/useYouTubePlayer'
import { useLanguage } from '@/context/LanguageContext'
import { twMerge } from 'tailwind-merge'

interface YouTubeTrailerPlayerProps {
  videoId: string
  /** Reveal window in seconds (1, 3, 5, 10) */
  duration: number
  /** Full trailer/movie length in seconds */
  trailerDuration: number | null
  isPlaying: boolean
  onFinished: () => void
  onError: (error: unknown) => void
  className?: string
}

const SCRUB_INTERVAL_MS = 120 // seek every 120ms — smooth without hammering YouTube API

export function YouTubeTrailerPlayer({
  videoId,
  duration,
  trailerDuration,
  isPlaying,
  onFinished,
  onError,
  className,
}: YouTubeTrailerPlayerProps) {
  const { t } = useLanguage()
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

  // Speed multiplier for display
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

      // Target position in full video
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
        'relative w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80',
        className
      )}
      style={{ aspectRatio: '16/9' }}
    >
      {/* YouTube iframe wrapper — upscaled & cropped so title bar & controls are hidden */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[125%] h-[125%] shrink-0 flex items-center justify-center scale-110">
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>

      {/* Black curtain — covers video when NOT scrubbing */}
      <div
        className="absolute inset-0 z-10 bg-cinema-950 transition-opacity duration-300 pointer-events-none flex flex-col items-center justify-center"
        style={{ opacity: showCurtain ? 1 : 0 }}
      >
        {!error && !isPlaying && (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-2xl shadow-gold-sm animate-pulse-slow">
              🎬
            </div>
            <p className="text-white font-bold text-sm tracking-wide">{t('fullMovieClip')}</p>
            <span className="text-white/40 text-xs">{t('secondsClip', { seconds: duration })}</span>
          </div>
        )}
      </div>

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black p-4 text-center">
          <div className="text-4xl mb-3">🎬</div>
          <p className="text-white font-semibold">Video Clip Unavailable</p>
          <p className="text-white/50 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading spinner */}
      {!error && showLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold-400/20 border-t-gold-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Speed badge */}
      {!error && isActive && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="bg-black/80 text-gold-400 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-gold-500/30 backdrop-blur-md">
            {speedMult}× {t('fullMovieClip')}
          </span>
        </div>
      )}

      {/* Timer badge */}
      {!error && isActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-mono border border-white/20 backdrop-blur-md">
            <span className="text-gold-400 font-bold">{wallElapsed.toFixed(1)}s</span>
            <span className="text-white/40"> / {duration}s</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10 z-20">
        <div
          className="h-full bg-gradient-gold"
          style={{ width: `${progressPercent}%`, transition: 'width 0.1s linear' }}
        />
      </div>
    </div>
  )
}
