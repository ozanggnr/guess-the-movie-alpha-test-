import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameApi, moviesApi } from '@/services/api'
import { GameHeader } from '@/components/GameHeader'
import { RoundIndicator } from '@/components/RoundIndicator'
import { YouTubeTrailerPlayer } from '@/components/YouTubeTrailerPlayer'
import { GuessInput } from '@/components/GuessInput'
import { GameFeedback } from '@/components/GameFeedback'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Film } from 'lucide-react'
import type { GameStartResponse } from '@/types'

export default function GamePage() {
  const navigate = useNavigate()

  // Game state
  const [gameState, setGameState] = useState<GameStartResponse & { trailerDuration: number | null } | null>(null)
  const [score, setScore] = useState<number>(0)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayedCurrentRound, setHasPlayedCurrentRound] = useState(false)

  // Input + guess state
  const [guess, setGuess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [revealedTitle, setRevealedTitle] = useState<string | null>(null)

  // Autocomplete titles
  const [movieTitles, setMovieTitles] = useState<string[]>([])

  // Initialization
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  // 1. Start a new game + fetch movie titles in parallel
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const [gameRes, titlesRes] = await Promise.all([
          gameApi.start(),
          moviesApi.getTitles(),
        ])
        if (mounted) {
          setGameState(gameRes.data as any)
          setMovieTitles((titlesRes.data as any).titles ?? [])
          setIsPlaying(true)
        }
      } catch (err: any) {
        if (mounted) {
          setInitError(err?.response?.data?.message || err.message || 'Failed to start game')
        }
      } finally {
        if (mounted) setIsInitializing(false)
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  const handleTrailerFinished = () => {
    setIsPlaying(false)
    setHasPlayedCurrentRound(true)
  }

  const handleTrailerError = (error: unknown) => {
    console.error('Trailer error:', error)
  }

  const submitGuess = async () => {
    if (!gameState || isSubmitting) return
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await gameApi.guess(gameState.gameId, guess)
      const data = response.data

      if (data.correct) {
        setFeedback('correct')
        setScore(data.score)
        setTimeout(() => {
          navigate('/result', {
            state: { status: 'WON', score: data.score },
            replace: true,
          })
        }, 1500)
      } else if (data.status === 'LOST') {
        setFeedback('wrong')
        setRevealedTitle(data.answer)
        setTimeout(() => {
          navigate('/result', {
            state: { status: 'LOST', score: 0, movieTitle: data.answer },
            replace: true,
          })
        }, 3000)
      } else {
        // Wrong but more rounds
        setFeedback('wrong')
        setTimeout(() => {
          setGuess('')
          setFeedback(null)
          setRevealedTitle(null)
          setHasPlayedCurrentRound(false)
          setGameState(prev => prev ? {
            ...prev,
            round: data.nextRound,
            revealDuration: data.revealDuration,
          } : null)
          setIsPlaying(true)
        }, 1500)
      }
    } catch (err) {
      console.error('Guess submission failed', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
        <p className="text-white/60 font-medium animate-pulse">Setting up the projector...</p>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-400 text-2xl">!</div>
        <h2 className="text-2xl font-bold mb-2">Failed to start game</h2>
        <p className="text-white/60 mb-6">{initError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!gameState) return null

  const isInputDisabled = isPlaying || isSubmitting || feedback === 'correct'
  const roundLabel = `Round ${gameState.round} · ${gameState.revealDuration}s reveal`

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-3 pb-4 overflow-hidden relative">
      <GameHeader score={score} />

      <main className="flex-1 flex flex-col items-center w-full gap-2 mt-1">
        {/* Round + duration indicator row */}
        <div className="flex items-center gap-3 w-full">
          <RoundIndicator currentRound={gameState.round} totalRounds={4} />
          <span className="text-white/40 text-xs font-mono ml-auto">{roundLabel}</span>
        </div>

        {/* Video player — compact 16:9 */}
        <div className="w-full">
          <YouTubeTrailerPlayer
            videoId={gameState.trailerYoutubeId}
            duration={gameState.revealDuration}
            trailerDuration={gameState.trailerDuration}
            isPlaying={isPlaying}
            onFinished={handleTrailerFinished}
            onError={handleTrailerError}
            className="shadow-2xl shadow-cyan-900/20"
          />
        </div>

        {/* Status line below video */}
        <div className="h-6 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.span
                key="watching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/40 text-xs uppercase tracking-widest font-mono"
              >
                Playing at {(gameState.trailerDuration && gameState.trailerDuration > 0
                  ? Math.min(gameState.trailerDuration / gameState.revealDuration, 16)
                  : 1).toFixed(1)}× speed…
              </motion.span>
            ) : hasPlayedCurrentRound ? (
              <motion.span
                key="guess"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/50 text-xs uppercase tracking-widest"
              >
                Type your guess below ↓
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Revealed movie title (after final wrong guess before redirect) */}
        <AnimatePresence>
          {revealedTitle && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full"
            >
              <Film className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-white/60 text-sm">The movie was </span>
              <span className="text-white font-bold text-sm">{revealedTitle}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback + Guess input */}
        <div className="w-full">
          <GameFeedback type={feedback} onClear={() => setFeedback(null)} />
          <GuessInput
            guess={guess}
            setGuess={setGuess}
            onSubmit={submitGuess}
            isDisabled={isInputDisabled}
            isLoading={isSubmitting}
            autoFocus={hasPlayedCurrentRound && !isPlaying}
            suggestions={movieTitles}
          />
        </div>
      </main>
    </div>
  )
}
