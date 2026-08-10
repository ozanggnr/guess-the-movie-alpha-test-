import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XCircle, CheckCircle2 } from 'lucide-react'

interface GameFeedbackProps {
  type: 'correct' | 'wrong' | null
  onClear?: () => void
}

export function GameFeedback({ type, onClear }: GameFeedbackProps) {
  useEffect(() => {
    if (type === 'wrong' && onClear) {
      const timer = setTimeout(onClear, 2500)
      return () => clearTimeout(timer)
    }
  }, [type, onClear])

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute left-0 right-0 -top-16 flex justify-center z-50 pointer-events-none"
        >
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-md border ${
              type === 'correct'
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-red-500/20 border-red-500/50 text-red-400'
            }`}
          >
            {type === 'correct' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-semibold tracking-wide">
              {type === 'correct' ? 'Correct!' : 'Not quite. Try again.'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
