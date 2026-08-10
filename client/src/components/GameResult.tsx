import { motion } from 'framer-motion'
import { Trophy, XOctagon, RotateCcw } from 'lucide-react'

interface GameResultProps {
  status: 'WON' | 'LOST'
  score: number
  movieTitle?: string // Only available if LOST, or if we pass it after WIN (though API doesn't pass it on WIN currently, user just knows they were correct)
  onPlayAgain: () => void
}

export function GameResult({ status, score, movieTitle, onPlayAgain }: GameResultProps) {
  const isWin = status === 'WON'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, delay: 0.1 }}
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
          isWin ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'
        }`}
      >
        {isWin ? <Trophy className="w-10 h-10" /> : <XOctagon className="w-10 h-10" />}
      </motion.div>

      <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
        {isWin ? 'Correct!' : 'Game Over'}
      </h2>

      {movieTitle && (
        <p className="text-white/60 mb-6 text-center">
          The movie was <br />
          <span className="text-xl font-bold text-white mt-1 block">{movieTitle}</span>
        </p>
      )}

      <div className="flex flex-col items-center justify-center bg-black/40 w-full rounded-lg py-4 mb-8 border border-white/5">
        <span className="text-sm text-white/50 uppercase tracking-widest mb-1">Final Score</span>
        <span className="text-4xl font-mono font-bold text-cyan-400">{score}</span>
      </div>

      <button
        onClick={onPlayAgain}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-black transition-all duration-200 bg-cyan-400 font-pj rounded-xl hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 w-full"
      >
        <RotateCcw className="w-5 h-5 mr-2 group-hover:-rotate-90 transition-transform duration-300" />
        Play Again
      </button>
    </motion.div>
  )
}
