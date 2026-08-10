interface RevealProgressProps {
  duration: number
}

export function RevealProgress({ duration }: RevealProgressProps) {
  // Total length of the progress bar string (e.g. 10 blocks)
  const totalBlocks = 10
  
  // Max duration in the game is 10s. So 1 block = 1 second.
  // E.g. 1s = 1 block filled, 9 empty.
  // 3s = 3 filled, 7 empty.
  const filledBlocks = Math.min(Math.round((duration / 10) * totalBlocks), totalBlocks)
  const emptyBlocks = totalBlocks - filledBlocks

  const filledChar = '█'
  const emptyChar = '░'

  const visualBar = filledChar.repeat(filledBlocks) + emptyChar.repeat(emptyBlocks)

  return (
    <div className="flex flex-col items-center justify-center space-y-1 font-mono text-sm text-cyan-400">
      <div className="tracking-widest opacity-80">{visualBar}</div>
      <div className="text-white/60 tracking-wider uppercase text-xs">
        Trailer Revealed: {duration} second{duration !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
