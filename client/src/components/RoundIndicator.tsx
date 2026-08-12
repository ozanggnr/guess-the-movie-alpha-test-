import { Fragment } from 'react'
import { clsx } from 'clsx'

interface RoundIndicatorProps {
  currentRound: number
  totalRounds: number
}

export function RoundIndicator({ currentRound, totalRounds }: RoundIndicatorProps) {
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center space-x-2 my-1">
      {rounds.map((round) => {
        const isActive = round === currentRound
        const isPast = round < currentRound

        return (
          <Fragment key={round}>
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                {
                  'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110': isActive,
                  'bg-white/20 text-white/60': isPast,
                  'bg-black border border-white/20 text-white/40': !isActive && !isPast,
                }
              )}
            >
              {round}
            </div>
            {round < totalRounds && (
              <div
                className={clsx('w-8 h-[2px] transition-colors duration-300', {
                  'bg-cyan-500/50': isPast,
                  'bg-white/10': !isPast,
                })}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
