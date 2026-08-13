import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { clsx } from 'clsx'

interface GuessInputProps {
  guess: string
  setGuess: (value: string) => void
  onSubmit: (directGuess?: string) => void
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
  const { t } = useLanguage()
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

  // Auto-focus after video finishes
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
    onSubmit(title)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && filtered.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); return }
      if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); selectSuggestion(filtered[activeIndex]); return }
      if (e.key === 'Escape') { setShowDropdown(false); return }
    }
    if (e.key === 'Enter' && !isDisabled && !isLoading && guess.trim().length > 0) {
      onSubmit(undefined)
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
          placeholder={isDisabled ? t('watchClipFirst') : t('typeMoviePlaceholder')}
          autoComplete="off"
          className={clsx(
            'w-full bg-black/70 border-2 rounded-2xl py-3.5 pl-4 pr-14 text-base text-white placeholder-white/30 outline-none transition-all duration-200 shadow-inner',
            {
              'border-gold-500/50 focus:border-gold-400 focus:shadow-[0_0_20px_rgba(245,158,11,0.2)]': !isDisabled,
              'border-white/10 opacity-50 cursor-not-allowed': isDisabled || isLoading,
            }
          )}
        />
        <button
          onClick={() => onSubmit(undefined)}
          disabled={isSubmitDisabled}
          className={clsx(
            'absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-xl font-bold transition-all duration-200',
            {
              'bg-gradient-gold text-cinema-950 hover:scale-105 active:scale-95 shadow-gold-sm': !isSubmitDisabled,
              'bg-white/10 text-white/20 cursor-not-allowed': isSubmitDisabled,
            }
          )}
          aria-label={t('submitGuess')}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>

      {/* Dropdown rendered via fixed portal positioning */}
      {showDropdown && filtered.length > 0 && (
        <div style={dropdownStyle}>
          <ul className="bg-[#0e1117] border border-gold-500/20 rounded-2xl shadow-2xl overflow-hidden py-1">
            {filtered.map((title, i) => (
              <li
                key={title}
                onMouseDown={e => { e.preventDefault(); selectSuggestion(title) }}
                className={clsx(
                  'px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 transition-colors',
                  i === activeIndex ? 'bg-gold-500/20 text-gold-300 font-semibold' : 'text-white/80 hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="text-white/30 text-xs font-mono w-4 shrink-0">{i + 1}</span>
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
      <span className="text-gold-400 font-bold">{title.slice(idx, idx + query.length)}</span>
      {title.slice(idx + query.length)}
    </>
  )
}
