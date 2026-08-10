import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { GameResult } from '@/components/GameResult'

interface ResultState {
  status: 'WON' | 'LOST'
  score: number
  movieTitle?: string
}

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const state = location.state as ResultState | null

  // If someone navigates to /result directly without state, redirect to home
  if (!state) {
    return <Navigate to="/" replace />
  }

  const handlePlayAgain = () => {
    navigate('/game', { replace: true })
  }

  return (
    <div className="flex-1 flex items-center justify-center w-full max-w-4xl mx-auto px-4 py-12">
      <GameResult
        status={state.status}
        score={state.score}
        movieTitle={state.movieTitle}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  )
}
