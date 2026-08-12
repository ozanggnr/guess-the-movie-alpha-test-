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
  const listRef = useRef<HTMLUListElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Filter suggestions by current input
  const filtered = guess.trim().length >= 1
    ? suggestions
        .filter(s => s.toLowerCase().includes(guess.toLowerCase()))
        .slice(0, 6)
    : []

  useEffect(() => {
    setActiveIndex(-1)
    setShowSuggestions(filtered.length > 0 && !isDisabled)
  }, [filtered.length, isDisabled, guess])

  // Auto-focus after trailer finishes
  useEffect(() => {
    if (autoFocus && !isDisabled && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isDisabled, autoFocus])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectSuggestion = (title: string) => {
    setGuess(title)
    setShowSuggestions(false)
    setActiveIndex(-1)
    setTimeout(() => onSubmit(), 50) // auto-submit on suggestion pick
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, -1))
        return
      }
      if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault()
        selectSuggestion(filtered[activeIndex])
        return
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        return
      }
    }
    if (e.key === 'Enter' && !isDisabled && !isLoading && guess.trim().length > 0) {
      onSubmit()
    }
  }

  const isSubmitDisabled = isDisabled || isLoading || guess.trim().length === 0

  return (
    <div className="w-full max-w-xl mx-auto mt-3 relative">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(filtered.length > 0 && !isDisabled)}
          disabled={isDisabled || isLoading}
          placeholder={isDisabled ? 'Watch the trailer...' : 'Guess the movie...'}
          autoComplete="off"
          className={clsx(
            'w-full bg-black/50 border-2 rounded-full py-3 pl-5 pr-14 text-base text-white placeholder-white/40 outline-none transition-all duration-300',
            {
              'border-cyan-500/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]': !isDisabled && !isLoading,
              'border-white/10 opacity-60 cursor-not-allowed': isDisabled || isLoading,
            }
          )}
        />
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className={clsx(
            'absolute right-1.5 top-1.5 bottom-1.5 aspect-square flex items-center justify-center rounded-full transition-all duration-300',
            {
              'bg-cyan-500 hover:bg-cyan-400 text-black hover:scale-105 active:scale-95': !isSubmitDisabled,
              'bg-white/10 text-white/30 cursor-not-allowed': isSubmitDisabled,
            }
          )}
          aria-label="Submit Guess"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 ml-0.5" />
          )}
        </button>
      </div>

      {/* Autocomplete dropdown */}
      {showSuggestions && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {filtered.map((title, i) => (
            <li
              key={title}
              onMouseDown={() => selectSuggestion(title)}
              className={clsx(
                'px-5 py-2.5 text-sm cursor-pointer transition-colors duration-100',
                i === activeIndex
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              )}
            >
              {/* Highlight matching substring */}
              {highlightMatch(title, guess)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Bold the matching portion of the suggestion */
function highlightMatch(title: string, query: string) {
  if (!query) return <>{title}</>
  const idx = title.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{title}</>
  return (
    <>
      {title.slice(0, idx)}
      <span className="font-bold text-cyan-400">{title.slice(idx, idx + query.length)}</span>
      {title.slice(idx + query.length)}
    </>
  )
}
