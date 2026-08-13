import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from '@/layouts/RootLayout'
import HomePage from '@/pages/HomePage'
import GamePage from '@/pages/GamePage'
import ResultPage from '@/pages/ResultPage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'

import { LanguageProvider } from '@/context/LanguageContext'
import { SessionProvider } from '@/context/SessionContext'
import { HeaderVisibilityProvider } from '@/context/HeaderVisibilityContext'

export default function App() {
  return (
    <LanguageProvider>
      <SessionProvider>
        <HeaderVisibilityProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="game" element={<GamePage />} />
                <Route path="result" element={<ResultPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </HeaderVisibilityProvider>
      </SessionProvider>
    </LanguageProvider>
  )
}
