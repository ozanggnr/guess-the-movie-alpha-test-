import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface SessionStats {
  sessionScore: number
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  bestStreak: number
}

interface SessionContextType extends SessionStats {
  addScore: (points: number) => void
  recordLoss: () => void
  recordSkip: () => void
  resetSession: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const STORAGE_KEY = 'cineriddle_session_stats'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<SessionStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Fallback
    }
    return {
      sessionScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  }, [stats])

  const addScore = (points: number) => {
    setStats(prev => {
      const newScore = prev.sessionScore + points
      const newStreak = prev.currentStreak + 1
      const newBest = Math.max(prev.bestStreak, newStreak)
      return {
        ...prev,
        sessionScore: newScore,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + 1,
        currentStreak: newStreak,
        bestStreak: newBest,
      }
    })
  }

  const recordLoss = () => {
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      currentStreak: 0,
    }))
  }

  const recordSkip = () => {
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      currentStreak: 0,
    }))
  }

  const resetSession = () => {
    setStats({
      sessionScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
    })
  }

  return (
    <SessionContext.Provider
      value={{
        ...stats,
        addScore,
        recordLoss,
        recordSkip,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
