import { useEffect, useRef, useState, useCallback } from 'react'
import { YouTubeTrailerPlayer } from './YouTubeTrailerPlayer'
import { useLanguage } from '@/context/LanguageContext'
import { twMerge } from 'tailwind-merge'

interface UniversalVideoPlayerProps {
  videoId: string
  videoUrl?: string | null
  duration: number
  trailerDuration: number | null
  isPlaying: boolean
  onFinished: () => void
  onError: (error: unknown) => void
  className?: string
}

export function UniversalVideoPlayer({
  videoId,
  videoUrl,
  duration,
  trailerDuration,
  isPlaying,
  onFinished,
  onError,
  className,
}: UniversalVideoPlayerProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [wallElapsed, setWallElapsed] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [useHtml5Fallback, setUseHtml5Fallback] = useState(Boolean(videoUrl))

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const onFinishedRef = useRef(onFinished)

  useEffect(() => { onFinishedRef.current = onFinished }, [onFinished])

  // If videoUrl is available, default to HTML5 video stream
  useEffect(() => {
    setUseHtml5Fallback(Boolean(videoUrl))
  }, [videoUrl, videoId])

  const stopScrubbing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    setIsActive(false)

    if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [])

  const startHtml5Scrubbing = useCallback(() => {
    stopScrubbing()
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback catch if browser blocks programmatic play
      })
    }

    startTimeRef.current = Date.now()
    setWallElapsed(0)
    setIsActive(true)

    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current || !videoRef.current) return

      const elapsed = (Date.now() - startTimeRef.current) / 1000
      setWallElapsed(elapsed)

      if (elapsed >= duration) {
        stopScrubbing()
        onFinishedRef.current()
        return
      }

      // Smooth scrub position across video
      const totalLen = videoRef.current.duration || trailerDuration || 300
      const targetPos = (elapsed / duration) * totalLen
      if (Math.abs(videoRef.current.currentTime - targetPos) > 0.3) {
        videoRef.current.currentTime = targetPos
      }
    }, 100)
  }, [duration, trailerDuration, stopScrubbing])

  useEffect(() => {
    if (!useHtml5Fallback) return

    if (isPlaying) {
      startHtml5Scrubbing()
    } else {
      stopScrubbing()
    }

    return () => stopScrubbing()
  }, [isPlaying, useHtml5Fallback, startHtml5Scrubbing, stopScrubbing])

  // If no direct videoUrl or HTML5 failed, use YouTube player
  if (!useHtml5Fallback || !videoUrl) {
    return (
      <YouTubeTrailerPlayer
        videoId={videoId}
        duration={duration}
        trailerDuration={trailerDuration}
        isPlaying={isPlaying}
        onFinished={onFinished}
        onError={(err) => {
          // If YT fails (e.g. adblocker / embedding error), attempt direct stream if available
          if (videoUrl) {
            setUseHtml5Fallback(true)
          } else {
            onError(err)
          }
        }}
        className={className}
      />
    )
  }

  const progressPercent = Math.min((wallElapsed / duration) * 100, 100)

  return (
    <div
      className={twMerge(
        'relative w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80',
        className
      )}
      style={{ aspectRatio: '16/9' }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        muted={false}
        preload="auto"
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Curtain when not playing */}
      <div
        className="absolute inset-0 z-10 bg-cinema-950 transition-opacity duration-300 pointer-events-none flex flex-col items-center justify-center"
        style={{ opacity: !isActive ? 1 : 0 }}
      >
        {!isPlaying && (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-2xl shadow-gold-sm animate-pulse-slow">
              🎬
            </div>
            <p className="text-white font-bold text-sm tracking-wide">{t('fullMovieClip')}</p>
            <span className="text-white/40 text-xs">{t('secondsClip', { seconds: duration })}</span>
          </div>
        )}
      </div>

      {/* Timer badge */}
      {isActive && (
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
