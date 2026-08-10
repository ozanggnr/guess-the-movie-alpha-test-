import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameApi } from '@/services/api'
import { GameHeader } from '@/components/GameHeader'
import { RoundIndicator } from '@/components/RoundIndicator'
import { YouTubeTrailerPlayer } from '@/components/YouTubeTrailerPlayer'
import { RevealProgress } from '@/components/RevealProgress'
import { GuessInput } from '@/components/GuessInput'
import { GameFeedback } from '@/components/GameFeedback'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { GameStartResponse } from '@/types'

export default function GamePage() {
  const navigate = useNavigate()
  
  // Game state
  const [gameState, setGameState] = useState<GameStartResponse | null>(null)
  const [score, setScore] = useState<number>(0)
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayedCurrentRound, setHasPlayedCurrentRound] = useState(false)
  
  // Input state
  const [guess, setGuess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  // Initialization
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  // 1. Start a new game on mount
  useEffect(() => {
    let mounted = true
    const initGame = async () => {
      try {
        const response = await gameApi.start()
        if (mounted) {
          setGameState(response.data)
          setIsPlaying(true) // Autoplay the first round
        }
      } catch (err: any) {
        if (mounted) {
          setInitError(err?.response?.data?.message || err.message || 'Failed to start game')
        }
      } finally {
        if (mounted) setIsInitializing(false)
      }
    }
    initGame()
    return () => { mounted = false }
  }, [])

  const handleTrailerFinished = () => {
    setIsPlaying(false)
    setHasPlayedCurrentRound(true)
  }

  const handleTrailerError = (error: unknown) => {
    console.error('Trailer error:', error)
    // Could show a toast or alternative UI
  }

  const submitGuess = async () => {
    if (!gameState || isSubmitting) return
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await gameApi.guess(gameState.gameId, guess)
      const data = response.data

      if (data.correct) {
        // WIN
        setFeedback('correct')
        setScore(data.score)
        setTimeout(() => {
          navigate('/result', {
            state: { status: 'WON', score: data.score },
            replace: true
          })
        }, 1500)
      } else if (data.status === 'LOST') {
        // LOSS
        setFeedback('wrong')
        setTimeout(() => {
          navigate('/result', {
            state: { status: 'LOST', score: 0, movieTitle: data.answer },
            replace: true
          })
        }, 2000)
      } else {
        // WRONG, NEXT ROUND
        setFeedback('wrong')
        setTimeout(() => {
          setGuess('')
          setHasPlayedCurrentRound(false)
          setGameState(prev => prev ? {
            ...prev,
            round: data.nextRound,
            revealDuration: data.revealDuration
          } : null)
          // Automatically start the next trailer
          setIsPlaying(true)
        }, 1500)
      }
    } catch (err) {
      console.error('Guess submission failed', err)
      // Toast notification would go here in a larger app
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
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-400 text-2xl">
          !
        </div>
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

  // The input is disabled if the trailer is currently playing, or if we are waiting for API
  const isInputDisabled = isPlaying || isSubmitting || feedback === 'correct'

  return (
    <div className="flex-1 flex flex-col pb-12 w-full max-w-5xl mx-auto px-4 overflow-hidden relative">
      <GameHeader score={score} />
      
      <main className="flex-1 flex flex-col items-center justify-center w-full mt-4">
        <RoundIndicator currentRound={gameState.round} totalRounds={4} />

        <div className="w-full max-w-3xl relative mt-4">
          <YouTubeTrailerPlayer
            videoId={gameState.trailerYoutubeId}
            duration={gameState.revealDuration}
            isPlaying={isPlaying}
            onFinished={handleTrailerFinished}
            onError={handleTrailerError}
            className="shadow-2xl shadow-cyan-900/20"
          />
        </div>

        <div className="mt-8 h-12 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <RevealProgress duration={gameState.revealDuration} />
              </motion.div>
            ) : hasPlayedCurrentRound ? (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white/60 font-medium tracking-wide uppercase text-sm"
              >
                Type your guess below
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="w-full relative mt-4">
          <GameFeedback type={feedback} onClear={() => setFeedback(null)} />
          <GuessInput
            guess={guess}
            setGuess={setGuess}
            onSubmit={submitGuess}
            isDisabled={isInputDisabled}
            isLoading={isSubmitting}
            autoFocus={hasPlayedCurrentRound && !isPlaying}
          />
        </div>
      </main>
    </div>
  )
}
