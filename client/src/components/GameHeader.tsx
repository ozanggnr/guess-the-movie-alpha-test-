import { motion, AnimatePresence } from 'framer-motion'

interface GameHeaderProps {
  score: number | null
}

export function GameHeader({ score }: GameHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between py-6 px-4 max-w-6xl mx-auto">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <span className="font-bold text-black text-lg">M</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">MovieGuess</h1>
      </div>

      <div className="flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
        <span className="text-white/60 text-sm font-medium mr-2 uppercase tracking-wider">Score</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-cyan-400 font-mono font-bold text-lg"
          >
            {score ?? 0}
          </motion.span>
        </AnimatePresence>
      </div>
    </header>
  )
}
