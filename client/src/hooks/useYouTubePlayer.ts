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

    // Ensure the global callback exists
    if (!(window as any).onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = () => {
        // Trigger a custom event when the API is ready, in case multiple instances are waiting
        window.dispatchEvent(new Event('youtube-api-ready'))
      }
    }
  }, [])

  // 2. Initialize the player when API is ready and container is mounted
  useEffect(() => {
    let isMounted = true

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !containerRef.current || !videoId) return

      playerRef.current = new window.YT.Player(containerRef.current, {
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
          playsinline: 1, // Crucial for iOS
        },
        events: {
          onReady: (event) => {
            if (isMounted) {
              // Mute immediately to allow autoplay without user interaction in some browsers
              // But here we rely on user clicking "Start Game" first, so we keep volume.
              // We'll set volume to 100% just in case.
              event.target.setVolume(100)
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
            let errorMsg = 'Unknown Error'
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
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [videoId]) // Re-init if videoId changes

  const playVideo = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo()
    }
  }, [])

  const pauseVideo = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo()
    }
  }, [])

  const seekTo = useCallback((seconds: number, allowSeekAhead: boolean = true) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, allowSeekAhead)
    }
  }, [])

  const getCurrentTime = useCallback((): number => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      return playerRef.current.getCurrentTime()
    }
    return 0
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
  }
}
