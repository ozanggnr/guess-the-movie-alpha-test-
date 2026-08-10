import { useEffect, useRef, useState } from 'react'
import { useYouTubePlayer } from '../hooks/useYouTubePlayer'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface YouTubeTrailerPlayerProps {
  videoId: string
  duration: number
  isPlaying: boolean
  onFinished: () => void
  onError: (error: unknown) => void
  className?: string
}

export function YouTubeTrailerPlayer({
  videoId,
  duration,
  isPlaying,
  onFinished,
  onError,
  className,
}: YouTubeTrailerPlayerProps) {
  const {
    containerRef,
    isReady,
    playerState,
    error,
    playVideo,
    pauseVideo,
    seekTo,
    getCurrentTime,
  } = useYouTubePlayer({
    videoId,
    onError,
  })

  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0)
  const [hasStartedCurrentRound, setHasStartedCurrentRound] = useState(false)
  const rafRef = useRef<number | null>(null)
  
  // Use refs for callbacks to avoid stale closures in RAF loop
  const latestDuration = useRef(duration)
  const latestOnFinished = useRef(onFinished)
  
  useEffect(() => {
    latestDuration.current = duration
    latestOnFinished.current = onFinished
  }, [duration, onFinished])

  // Precision timing loop
  useEffect(() => {
    if (!isReady) return

    const tick = () => {
      const currentTime = getCurrentTime()
      setCurrentPlaybackTime(currentTime)

      if (currentTime >= latestDuration.current) {
        pauseVideo()
        latestOnFinished.current()
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        return // Stop the loop for this round
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    if (isPlaying && playerState === 'PLAYING') {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, playerState, isReady, getCurrentTime, pauseVideo])

  // Handle play/pause commands from parent
  useEffect(() => {
    if (!isReady) return

    if (isPlaying) {
      if (!hasStartedCurrentRound) {
        // Only seek to 0 when we initially start the round
        seekTo(0, true)
        setHasStartedCurrentRound(true)
      }
      playVideo()
    } else {
      pauseVideo()
      setHasStartedCurrentRound(false) // Reset for next time isPlaying becomes true
    }
  }, [isPlaying, isReady, playVideo, pauseVideo, seekTo, hasStartedCurrentRound])

  // Derived UI states
  const showLoading = !isReady || (isPlaying && playerState === 'BUFFERING')
  const showRevealProgress = isPlaying && playerState === 'PLAYING'
  const progressPercent = Math.min((currentPlaybackTime / duration) * 100, 100)

  return (
    <div
      className={twMerge(
        'relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl',
        className
      )}
    >
      {/* 
        The YouTube iframe container. 
        pointer-events-none prevents user interaction (pausing, seeking, clicking external links).
      */}
      <div
        className={clsx('absolute inset-0 pointer-events-none transition-opacity duration-300', {
          'opacity-0': !isReady || error,
          'opacity-100': isReady && !error,
        })}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 text-center z-20">
          <svg className="w-12 h-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-white text-lg font-semibold tracking-wide">Video Unavailable</p>
          <p className="text-white/60 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading / Buffering Overlay */}
      {!error && showLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Reveal Progress HUD (Only shown while actually playing) */}
      {!error && showRevealProgress && (
        <div className="absolute top-4 left-0 w-full flex justify-center z-10 pointer-events-none">
          <div className="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-mono tracking-wider border border-white/20 shadow-lg">
            Trailer Reveal <span className="text-cyan-400">{currentPlaybackTime.toFixed(1)}</span> / {duration.toFixed(1)}s
          </div>
        </div>
      )}

      {/* Bottom Progress Bar */}
      {!error && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10 z-10">
          <div 
            className="h-full bg-cyan-400 transition-all duration-75 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  )
}
