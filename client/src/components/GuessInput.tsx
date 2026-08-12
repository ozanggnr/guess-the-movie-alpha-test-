import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface GuessInputProps {
  guess: string
  setGuess: (value: string) => void
  onSubmit: () => void
  isDisabled: boolean
  isLoading: boolean
  autoFocus?: boolean
  suggestions?: string[]
}

export function GuessInput({
  guess,
  setGuess,
  onSubmit,
  isDisabled,
  isLoading,
  autoFocus = false,
  suggestions = [],
}: GuessInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  // Filter suggestions
  const filtered = guess.trim().length >= 1
    ? suggestions.filter(s => s.toLowerCase().includes(guess.toLowerCase())).slice(0, 7)
    : []

  // Position dropdown using getBoundingClientRect so it's never clipped
  const updateDropdownPos = () => {
    if (!wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    })
  }

  useEffect(() => {
    setActiveIndex(-1)
    if (filtered.length > 0 && !isDisabled && document.activeElement === inputRef.current) {
      updateDropdownPos()
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [filtered.length, isDisabled, guess]) // eslint-disable-line

  // Auto-focus after trailer finishes
  useEffect(() => {
    if (autoFocus && !isDisabled && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isDisabled, autoFocus])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Update position on scroll/resize
  useEffect(() => {
    if (!showDropdown) return
    const update = () => updateDropdownPos()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [showDropdown]) // eslint-disable-line

  const selectSuggestion = (title: string) => {
    setGuess(title)
    setShowDropdown(false)
    setActiveIndex(-1)
    // Brief delay then submit
    setTimeout(() => {
      setGuess(title)
      onSubmit()
    }, 30)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && filtered.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); return }
      if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); selectSuggestion(filtered[activeIndex]); return }
      if (e.key === 'Escape') { setShowDropdown(false); return }
    }
    if (e.key === 'Enter' && !isDisabled && !isLoading && guess.trim().length > 0) {
      onSubmit()
    }
  }

  const isSubmitDisabled = isDisabled || isLoading || guess.trim().length === 0

  return (
    <div ref={wrapperRef} className="w-full relative">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id="guess-input"
          type="text"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filtered.length > 0 && !isDisabled) {
              updateDropdownPos()
              setShowDropdown(true)
            }
          }}
          disabled={isDisabled || isLoading}
          placeholder={isDisabled ? 'Watch the trailer first…' : 'Type a movie title…'}
          autoComplete="off"
          className={clsx(
            'w-full bg-black/60 border-2 rounded-xl py-3 pl-4 pr-12 text-base text-white placeholder-white/30 outline-none transition-all duration-200',
            {
              'border-cyan-500/60 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.15)]': !isDisabled,
              'border-white/10 opacity-50 cursor-not-allowed': isDisabled || isLoading,
            }
          )}
        />
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className={clsx(
            'absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg transition-all duration-200',
            {
              'bg-cyan-500 hover:bg-cyan-400 text-black hover:scale-105 active:scale-95': !isSubmitDisabled,
              'bg-white/10 text-white/20 cursor-not-allowed': isSubmitDisabled,
            }
          )}
          aria-label="Submit Guess"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
        </button>
      </div>

      {/* Dropdown rendered via portal-style fixed positioning — never clipped */}
      {showDropdown && filtered.length > 0 && (
        <div style={dropdownStyle}>
          <ul className="bg-[#0d0f14] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {filtered.map((title, i) => (
              <li
                key={title}
                onMouseDown={e => { e.preventDefault(); selectSuggestion(title) }}
                className={clsx(
                  'px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 transition-colors',
                  i === activeIndex ? 'bg-cyan-500/20 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="text-white/20 text-xs font-mono w-3 shrink-0">{i + 1}</span>
                {highlightMatch(title, guess)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function highlightMatch(title: string, query: string) {
  if (!query) return <>{title}</>
  const idx = title.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{title}</>
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-cyan-400 font-semibold">{title.slice(idx, idx + query.length)}</span>
      {title.slice(idx + query.length)}
    </>
  )
}
