import { useEffect, useRef, useState, useCallback } from 'react'

export type PlayerState =
  | 'UNSTARTED'
  | 'ENDED'
  | 'PLAYING'
  | 'PAUSED'
  | 'BUFFERING'
  | 'CUED'
  | 'UNKNOWN'

interface UseYouTubePlayerProps {
  videoId: string
  onError?: (error: unknown) => void
}

export function useYouTubePlayer({ videoId, onError }: UseYouTubePlayerProps) {
  const [isReady, setIsReady] = useState(false)
  const [playerState, setPlayerState] = useState<PlayerState>('UNSTARTED')
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)

  // 1. Load the YouTube IFrame API script dynamically
  useEffect(() => {
    const existingScript = document.getElementById('youtube-iframe-api')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'youtube-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.body.appendChild(script)
    }

    if (!(window as any).onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = () => {
        window.dispatchEvent(new Event('youtube-api-ready'))
      }
    }
  }, [])

  // 2. Initialize the player when API is ready and container is mounted
  useEffect(() => {
    let isMounted = true

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !containerRef.current || !videoId) return

      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          host: 'https://www.youtube-nocookie.com', // Privacy mode avoids doubleclick ad server blocking
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playsinline: 1,
            origin: window.location.origin, // Explicit origin for hosting platforms like Railway/Vercel
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              if (isMounted) {
                try {
                  event.target.setVolume(100)
                  // Add permission attributes to iframe element if accessible
                  const iframe = event.target.getIframe?.()
                  if (iframe) {
                    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture')
                  }
                } catch {
                  // Ignore minor iframe attribute access restrictions
                }
                setIsReady(true)
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return
              switch (event.data) {
                case window.YT.PlayerState.UNSTARTED:
                  setPlayerState('UNSTARTED')
                  break
                case window.YT.PlayerState.ENDED:
                  setPlayerState('ENDED')
                  break
                case window.YT.PlayerState.PLAYING:
                  setPlayerState('PLAYING')
                  break
                case window.YT.PlayerState.PAUSED:
                  setPlayerState('PAUSED')
                  break
                case window.YT.PlayerState.BUFFERING:
                  setPlayerState('BUFFERING')
                  break
                case window.YT.PlayerState.CUED:
                  setPlayerState('CUED')
                  break
                default:
                  setPlayerState('UNKNOWN')
                  break
              }
            },
            onError: (event) => {
              if (!isMounted) return
              let errorMsg = 'Video unavailable'
              switch (event.data) {
                case 2:
                  errorMsg = 'Invalid video ID'
                  break
                case 5:
                  errorMsg = 'HTML5 player error'
                  break
                case 100:
                  errorMsg = 'Video not found or removed'
                  break
                case 101:
                case 150:
                  errorMsg = 'Embedding disabled by owner'
                  break
              }
              setError(errorMsg)
              if (onError) onError(new Error(errorMsg))
            },
          },
        })
      } catch (err) {
        if (isMounted) {
          setError('Failed to initialize video player')
        }
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      const handleReady = () => initPlayer()
      window.addEventListener('youtube-api-ready', handleReady)
      return () => {
        window.removeEventListener('youtube-api-ready', handleReady)
      }
    }

    return () => {
      isMounted = false
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {
          // Ignore destruction errors
        }
        playerRef.current = null
      }
    }
  }, [videoId])

  const playVideo = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.playVideo()
      } catch {
        // Safe catch
      }
    }
  }, [])

  const pauseVideo = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo()
      } catch {
        // Safe catch
      }
    }
  }, [])

  const seekTo = useCallback((seconds: number, allowSeekAhead: boolean = true) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seconds, allowSeekAhead)
      } catch {
        // Safe catch
      }
    }
  }, [])

  const getCurrentTime = useCallback((): number => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      try {
        return playerRef.current.getCurrentTime()
      } catch {
        return 0
      }
    }
    return 0
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      try {
        playerRef.current.setPlaybackRate(rate)
      } catch {
        // Safe catch
      }
    }
  }, [])

  return {
    containerRef,
    isReady,
    playerState,
    error,
    playVideo,
    pauseVideo,
    seekTo,
    getCurrentTime,
    setPlaybackRate,
  }
}
