import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import HomePage from '@/pages/HomePage'
import GamePage from '@/pages/GamePage'
import ResultPage from '@/pages/ResultPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="result" element={<ResultPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
