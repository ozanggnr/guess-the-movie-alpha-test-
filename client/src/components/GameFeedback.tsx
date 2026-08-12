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
      const timer = setTimeout(onClear, 2000)
      return () => clearTimeout(timer)
    }
  }, [type, onClear])

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="w-full mb-2"
        >
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium ${
              type === 'correct'
                ? 'bg-green-500/15 border-green-500/30 text-green-400'
                : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}
          >
            {type === 'correct' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>{type === 'correct' ? '✓ Correct! Well done.' : '✗ Not quite — try again.'}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
