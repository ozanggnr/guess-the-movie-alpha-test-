import { cn } from '@/utils/cn'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

const sizeMap = {
  sm: { icon: 'text-xl', title: 'text-lg', tagline: 'text-xs' },
  md: { icon: 'text-3xl', title: 'text-2xl', tagline: 'text-sm' },
  lg: { icon: 'text-5xl', title: 'text-4xl', tagline: 'text-base' },
}

export default function Logo({ className, size = 'md', showTagline = false }: LogoProps) {
  const s = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Film reel icon */}
      <div className={cn('relative', s.icon)}>
        <span
          className="inline-block"
          role="img"
          aria-label="film reel"
          style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' }}
        >
          🎬
        </span>
      </div>

      <div className="flex flex-col">
        <span
          className={cn('font-black tracking-tight leading-none text-shimmer', s.title)}
        >
          MovieGuess
        </span>
        {showTagline && (
          <span className={cn('text-white/40 font-medium tracking-widest uppercase mt-1', s.tagline)}>
            Can you name the film?
          </span>
        )}
      </div>
    </div>
  )
}
