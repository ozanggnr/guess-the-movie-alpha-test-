import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameApi, moviesApi } from '@/services/api'
import { GameHeader } from '@/components/GameHeader'
import { RoundIndicator } from '@/components/RoundIndicator'
import { YouTubeTrailerPlayer } from '@/components/YouTubeTrailerPlayer'
import { GuessInput } from '@/components/GuessInput'
import { GameFeedback } from '@/components/GameFeedback'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Film, SkipForward } from 'lucide-react'
import type { GameStartResponse } from '@/types'

type GameStateType = GameStartResponse & { trailerDuration: number | null }

export default function GamePage() {
  const navigate = useNavigate()

  const [gameState, setGameState] = useState<GameStateType | null>(null)
  const [score, setScore] = useState(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayedCurrentRound, setHasPlayedCurrentRound] = useState(false)

  const [guess, setGuess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [revealedTitle, setRevealedTitle] = useState<string | null>(null)

  const [movieTitles, setMovieTitles] = useState<string[]>([])
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  const startNewGame = async () => {
    setIsInitializing(true)
    setFeedback(null)
    setRevealedTitle(null)
    setGuess('')
    setHasPlayedCurrentRound(false)
    setIsPlaying(false)
    setScore(0)
    try {
      const gameRes = await gameApi.start()
      setGameState(gameRes.data as GameStateType)
      setIsPlaying(true)
    } catch (err: any) {
      setInitError(err?.response?.data?.message || err.message || 'Failed to start game')
    } finally {
      setIsInitializing(false)
    }
  }

  // Initial load
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const [gameRes, titlesRes] = await Promise.all([
          gameApi.start(),
          moviesApi.getTitles(),
        ])
        if (!mounted) return
        setGameState(gameRes.data as GameStateType)
        setMovieTitles((titlesRes.data as any).titles ?? [])
        setIsPlaying(true)
      } catch (err: any) {
        if (mounted) setInitError(err?.response?.data?.message || err.message || 'Failed to start game')
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

  const submitGuess = async (directGuess?: string) => {
    const guessToSubmit = (directGuess ?? guess).trim()
    if (!gameState || isSubmitting || !guessToSubmit) return
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const res = await gameApi.guess(gameState.gameId, guessToSubmit)
      const data = res.data

      if (data.correct) {
        setFeedback('correct')
        setScore(data.score)
        setTimeout(() => navigate('/result', { state: { status: 'WON', score: data.score }, replace: true }), 1500)
      } else if (data.status === 'LOST') {
        setFeedback('wrong')
        setRevealedTitle(data.answer)
        setTimeout(() => navigate('/result', { state: { status: 'LOST', score: 0, movieTitle: data.answer }, replace: true }), 3500)
      } else {
        // Wrong — advance round
        setFeedback('wrong')
        setTimeout(() => {
          setGuess('')
          setFeedback(null)
          setRevealedTitle(null)
          setHasPlayedCurrentRound(false)
          setGameState(prev => prev ? { ...prev, round: data.nextRound, revealDuration: data.revealDuration } : null)
          setIsPlaying(true)
        }, 1200)
      }
    } catch (err) {
      console.error('Guess failed', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => navigate('/result', { state: { status: 'LOST', score: 0 }, replace: true })

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isInitializing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-3" />
        <p className="text-white/50 text-sm animate-pulse">Setting up the projector…</p>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p className="text-white/60 mb-4">{initError}</p>
        <button onClick={() => window.location.reload()} className="bg-cyan-500 text-black font-bold px-6 py-2 rounded-xl">
          Try Again
        </button>
      </div>
    )
  }

  if (!gameState) return null

  const isInputDisabled = isPlaying || isSubmitting || feedback === 'correct'
  const speedMult = gameState.trailerDuration && gameState.trailerDuration > 0
    ? (gameState.trailerDuration / gameState.revealDuration).toFixed(1)
    : '1.0'

  return (
    // NOTE: no overflow-hidden — needed so the guess dropdown (fixed position) is visible
    <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-3 pb-6">
      <GameHeader score={score} />

      <div className="flex flex-col gap-2 w-full">

        {/* Round pills + skip button row */}
        <div className="flex items-center justify-between w-full px-1">
          <RoundIndicator currentRound={gameState.round} totalRounds={4} />
          <button
            onClick={handleSkip}
            title="Skip this movie"
            className="flex items-center gap-1 text-white/30 hover:text-white/70 text-xs transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>
        </div>

        {/* Video player */}
        <div className="w-full">
          <YouTubeTrailerPlayer
            videoId={gameState.trailerYoutubeId}
            duration={gameState.revealDuration}
            trailerDuration={gameState.trailerDuration}
            isPlaying={isPlaying}
            onFinished={handleTrailerFinished}
            onError={() => {}}
            className="shadow-2xl shadow-black/60"
          />
        </div>

        {/* Status row below video */}
        <div className="flex items-center justify-between px-1 h-5">
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.span key="playing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-white/40 text-[11px] font-mono"
              >
                ▶ Playing at {speedMult}× · scrubbing entire trailer
              </motion.span>
            ) : hasPlayedCurrentRound ? (
              <motion.span key="guess"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-cyan-400/70 text-[11px] font-mono"
              >
                ↓ Type your guess below
              </motion.span>
            ) : null}
          </AnimatePresence>
          <span className="text-white/20 text-[11px] font-mono ml-auto">
            Round {gameState.round} · {gameState.revealDuration}s window
          </span>
        </div>

        {/* Movie title reveal (final loss) */}
        <AnimatePresence>
          {revealedTitle && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 w-full"
            >
              <Film className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-white/60 text-sm">The movie was </span>
              <span className="text-white font-bold text-sm">{revealedTitle}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback toast */}
        <div className="relative">
          <GameFeedback type={feedback} onClear={() => setFeedback(null)} />
        </div>

        {/* Guess input — dropdown uses position:fixed so it's never clipped */}
        <GuessInput
          guess={guess}
          setGuess={setGuess}
          onSubmit={submitGuess}
          isDisabled={isInputDisabled}
          isLoading={isSubmitting}
          autoFocus={hasPlayedCurrentRound && !isPlaying}
          suggestions={movieTitles}
        />

        {/* After correct guess — offer to play again immediately */}
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mt-1"
            >
              <span className="text-green-400 font-bold text-sm">🎉 Correct!</span>
              <button
                onClick={startNewGame}
                className="text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-1.5 rounded-lg transition-colors"
              >
                Next Movie →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
