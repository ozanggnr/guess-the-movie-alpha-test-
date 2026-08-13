import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { useSession } from '@/context/SessionContext'
import { Flame, Award, Trophy } from 'lucide-react'

interface GameHeaderProps {
  roundScore?: number | null
}

export function GameHeader({ roundScore }: GameHeaderProps) {
  const { t } = useLanguage()
  const { sessionScore, currentStreak } = useSession()

  return (
    <header className="w-full flex items-center justify-between py-2 px-2 max-w-3xl mx-auto">
      {/* Brand logo mini */}
      <div className="flex items-center space-x-2 select-none">
        <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold-sm">
          <span className="font-black text-cinema-950 text-base">C</span>
        </div>
        <h1 className="text-lg font-black tracking-tight text-white hidden sm:block">
          Cine<span className="text-gold-400">Riddle</span>
        </h1>
      </div>

      {/* Stats container */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak badge */}
        {currentStreak > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-400 text-xs font-bold"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 animate-pulse" />
            <span>{currentStreak} {t('streak')}</span>
          </motion.div>
        )}

        {/* Round Score pill */}
        {roundScore !== undefined && roundScore !== null && roundScore > 0 && (
          <div className="hidden xs:flex items-center bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-xs">
            <Award className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
            <span className="text-white/50 mr-1">{t('roundScore')}:</span>
            <span className="text-cyan-400 font-mono font-bold">{roundScore}</span>
          </div>
        )}

        {/* Stacked Session Score */}
        <div className="flex items-center bg-black/60 border border-gold-500/30 rounded-full px-3.5 py-1.5 backdrop-blur-md shadow-gold-sm">
          <Trophy className="w-4 h-4 text-gold-400 mr-1.5 shrink-0" />
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider mr-1.5">
            {t('sessionScore')}
          </span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={sessionScore}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-gold-400 font-mono font-black text-sm sm:text-base"
            >
              {sessionScore.toLocaleString()}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
