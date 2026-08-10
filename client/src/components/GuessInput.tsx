import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface GuessInputProps {
  guess: string
  setGuess: (value: string) => void
  onSubmit: () => void
  isDisabled: boolean
  isLoading: boolean
  autoFocus?: boolean
}

export function GuessInput({
  guess,
  setGuess,
  onSubmit,
  isDisabled,
  isLoading,
  autoFocus = false,
}: GuessInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when enabled (e.g. after trailer finishes)
  useEffect(() => {
    if (autoFocus && !isDisabled && inputRef.current) {
      // Small timeout ensures UI is fully rendered before focusing
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isDisabled, autoFocus])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isDisabled && !isLoading && guess.trim().length > 0) {
      onSubmit()
    }
  }

  const isSubmitDisabled = isDisabled || isLoading || guess.trim().length === 0

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled || isLoading}
          placeholder={isDisabled ? "Watch the trailer..." : "Guess the movie..."}
          className={clsx(
            "w-full bg-black/50 border-2 rounded-full py-4 pl-6 pr-16 text-lg text-white placeholder-white/40 outline-none transition-all duration-300",
            {
              "border-cyan-500/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]": !isDisabled && !isLoading,
              "border-white/10 opacity-60 cursor-not-allowed": isDisabled || isLoading,
            }
          )}
        />
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className={clsx(
            "absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-full transition-all duration-300",
            {
              "bg-cyan-500 hover:bg-cyan-400 text-black hover:scale-105 active:scale-95": !isSubmitDisabled,
              "bg-white/10 text-white/30 cursor-not-allowed": isSubmitDisabled,
            }
          )}
          aria-label="Submit Guess"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  )
}
