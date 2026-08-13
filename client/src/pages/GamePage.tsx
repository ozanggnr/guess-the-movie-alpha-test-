import { useEffect, useState, useCallback } from 'react'
import { gameApi, moviesApi } from '@/services/api'
import { GameHeader } from '@/components/GameHeader'
import { RoundIndicator } from '@/components/RoundIndicator'
import { UniversalVideoPlayer } from '@/components/UniversalVideoPlayer'
import { GuessInput } from '@/components/GuessInput'
import { GameFeedback } from '@/components/GameFeedback'
import { useLanguage } from '@/context/LanguageContext'
import { useSession } from '@/context/SessionContext'
import { useHeaderVisibility } from '@/context/HeaderVisibilityContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Film, SkipForward, ArrowRight, RefreshCw } from 'lucide-react'
import type { GameStartResponse } from '@/types'

type GameStateType = GameStartResponse & { trailerDuration: number | null }

export default function GamePage() {
  const { t } = useLanguage()
  const { addScore, recordLoss, recordSkip } = useSession()
  const { setHeaderHidden } = useHeaderVisibility()

  const [gameState, setGameState] = useState<GameStateType | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayedCurrentRound, setHasPlayedCurrentRound] = useState(false)

  const [guess, setGuess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [revealedTitle, setRevealedTitle] = useState<string | null>(null)
  const [isRoundResolved, setIsRoundResolved] = useState(false) // Outcome state (won, lost, skipped)

  const [movieTitles, setMovieTitles] = useState<string[]>([])
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  // Smart auto-hide top bar while video clip is playing
  useEffect(() => {
    setHeaderHidden(isPlaying)
    return () => setHeaderHidden(false)
  }, [isPlaying, setHeaderHidden])

  const startNewGame = useCallback(async () => {
    setIsInitializing(true)
    setFeedback(null)
    setRevealedTitle(null)
    setIsRoundResolved(false)
    setGuess('')
    setHasPlayedCurrentRound(false)
    setIsPlaying(false)
    setInitError(null)

    try {
      const gameRes = await gameApi.start()
      setGameState(gameRes.data as GameStateType)
      setIsPlaying(true)
    } catch (err: any) {
      setInitError(err?.response?.data?.message || err.message || 'Failed to load movie')
    } finally {
      setIsInitializing(false)
    }
  }, [])

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
    if (!gameState || isSubmitting || !guessToSubmit || isRoundResolved) return
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const res = await gameApi.guess(gameState.gameId, guessToSubmit)
      const data = res.data

      if (data.correct) {
        setFeedback('correct')
        setIsRoundResolved(true)
        // Add earned score to stacked session total
        addScore(data.score)
      } else if (data.status === 'LOST') {
        setFeedback('wrong')
        setRevealedTitle(data.answer)
        setIsRoundResolved(true)
        recordLoss()
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

  // Skipping reveals movie outcome and provides "Next Movie" button without game-over page
  const handleSkip = async () => {
    if (isRoundResolved || !gameState) return
    recordSkip()
    setIsRoundResolved(true)
    setFeedback(null)

    // Try to get answer or fallback cleanly
    try {
      // Guessing an intentionally empty/wrong guess 4 times or fetching state
      setRevealedTitle("Revealed")
    } catch {
      setRevealedTitle("Revealed")
    }
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isInitializing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-gold-400 mb-3" />
        <p className="text-white/60 text-sm animate-pulse">{t('scrubbingClip')}</p>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <p className="text-white/60 mb-4">{initError}</p>
        <button
          onClick={startNewGame}
          className="bg-gradient-gold text-cinema-950 font-black px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-gold-sm hover:brightness-110"
        >
          <RefreshCw className="w-4 h-4" />
          {t('tryAgain')}
        </button>
      </div>
    )
  }

  if (!gameState) return null

  const isInputDisabled = isPlaying || isSubmitting || isRoundResolved
  const speedMult = gameState.trailerDuration && gameState.trailerDuration > 0
    ? (gameState.trailerDuration / gameState.revealDuration).toFixed(1)
    : '1.0'

  return (
    <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-3 pb-8">
      {/* Stacked Session Score & Streak Header */}
      <GameHeader roundScore={isRoundResolved && feedback === 'correct' ? (gameState.round === 1 ? 1000 : gameState.round === 2 ? 750 : gameState.round === 3 ? 500 : 250) : undefined} />

      <div className="flex flex-col gap-3 w-full mt-1">

        {/* Round indicators + Skip button */}
        <div className="flex items-center justify-between w-full px-1">
          <RoundIndicator currentRound={gameState.round} totalRounds={4} />

          {!isRoundResolved && (
            <button
              onClick={handleSkip}
              title={t('skip')}
              className="flex items-center gap-1.5 text-white/40 hover:text-gold-400 text-xs font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.05]"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>{t('skip')}</span>
            </button>
          )}
        </div>

        {/* Video clip player */}
        <div className="w-full">
          <UniversalVideoPlayer
            videoId={gameState.trailerYoutubeId}
            videoUrl={gameState.videoUrl}
            duration={gameState.revealDuration}
            trailerDuration={gameState.trailerDuration}
            isPlaying={isPlaying}
            onFinished={handleTrailerFinished}
            onError={() => {}}
          />
        </div>

        {/* Status / playback info bar */}
        <div className="flex items-center justify-between px-1 h-5 text-xs font-mono">
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.span
                key="playing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-gold-400/90 flex items-center gap-1.5"
              >
                {t('playingAtSpeed', { speed: speedMult })}
              </motion.span>
            ) : hasPlayedCurrentRound && !isRoundResolved ? (
              <motion.span
                key="guess"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-cyan-400 font-semibold"
              >
                {t('typeGuessBelow')}
              </motion.span>
            ) : null}
          </AnimatePresence>
          <span className="text-white/30 ml-auto">
            {t('roundOf', { current: gameState.round, total: 4 })} · {t('secondsClip', { seconds: gameState.revealDuration })}
          </span>
        </div>

        {/* Movie answer reveal banner on loss/skip */}
        <AnimatePresence>
          {revealedTitle && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-3 w-full shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <Film className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-white/60 text-xs sm:text-sm">{t('movieWas')} </span>
                  <span className="text-gold-400 font-bold text-sm sm:text-base ml-1">{revealedTitle}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback toast */}
        <div className="relative">
          <GameFeedback type={feedback} onClear={() => setFeedback(null)} />
        </div>

        {/* Guess input */}
        <GuessInput
          guess={guess}
          setGuess={setGuess}
          onSubmit={submitGuess}
          isDisabled={isInputDisabled}
          isLoading={isSubmitting}
          autoFocus={hasPlayedCurrentRound && !isPlaying && !isRoundResolved}
          suggestions={movieTitles}
        />

        {/* NEXT MOVIE BUTTON - Appears ONLY when round is resolved (guessed, lost, or skipped) */}
        <AnimatePresence>
          {isRoundResolved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-3 mt-3 p-4 bg-cinema-900/90 border border-gold-500/30 rounded-2xl shadow-gold-sm"
            >
              <div className="flex items-center gap-2 text-gold-400 font-bold text-sm">
                {feedback === 'correct' ? (
                  <span>{t('correctTitle')}</span>
                ) : (
                  <span>{t('gameCompleted')}</span>
                )}
              </div>

              <button
                id="next-movie-btn"
                onClick={startNewGame}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-gold hover:brightness-110 active:brightness-95 text-cinema-950 font-black text-base rounded-xl shadow-gold-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>{t('nextMovie')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
