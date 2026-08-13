import { motion } from 'framer-motion'
import { Trophy, XOctagon, ArrowRight, Flame } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useSession } from '@/context/SessionContext'

interface GameResultProps {
  status: 'WON' | 'LOST'
  score: number
  movieTitle?: string
  onPlayAgain: () => void
}

export function GameResult({ status, score, movieTitle, onPlayAgain }: GameResultProps) {
  const { t } = useLanguage()
  const { sessionScore, currentStreak } = useSession()
  const isWin = status === 'WON'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 bg-cinema-900/90 backdrop-blur-xl border border-gold-500/30 rounded-2xl shadow-2xl max-w-md w-full mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, delay: 0.1 }}
        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${
          isWin ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}
      >
        {isWin ? <Trophy className="w-10 h-10" /> : <XOctagon className="w-10 h-10" />}
      </motion.div>

      <h2 className="text-3xl font-black tracking-tight text-white mb-2">
        {isWin ? t('victoryTitle') : t('defeatTitle')}
      </h2>

      {movieTitle && (
        <p className="text-white/60 mb-6 text-center text-sm">
          {t('movieWas')} <br />
          <span className="text-xl font-bold text-gold-400 mt-1 block">{movieTitle}</span>
        </p>
      )}

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        <div className="flex flex-col items-center justify-center bg-black/50 p-4 rounded-xl border border-white/10">
          <span className="text-xs text-white/40 uppercase font-semibold tracking-wider mb-1">{t('finalScore')}</span>
          <span className="text-2xl font-mono font-bold text-cyan-400">+{score}</span>
        </div>

        <div className="flex flex-col items-center justify-center bg-black/50 p-4 rounded-xl border border-gold-500/20">
          <span className="text-xs text-gold-400/80 uppercase font-semibold tracking-wider mb-1">{t('sessionScore')}</span>
          <span className="text-2xl font-mono font-black text-gold-400">{sessionScore.toLocaleString()}</span>
        </div>
      </div>

      {currentStreak > 0 && (
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
          <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
          <span>{currentStreak} {t('streak')}</span>
        </div>
      )}

      <button
        onClick={onPlayAgain}
        className="w-full inline-flex items-center justify-center px-8 py-4 font-black text-cinema-950 transition-all duration-200 bg-gradient-gold hover:brightness-110 active:brightness-95 rounded-xl shadow-gold-md gap-2"
      >
        <span>{t('playNextMovie')}</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  )
}
