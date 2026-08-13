import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useLanguage } from '@/context/LanguageContext'
import { useHeaderVisibility } from '@/context/HeaderVisibilityContext'

export default function RootLayout() {
  const { t } = useLanguage()
  const { isHeaderHidden } = useHeaderVisibility()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isHoveredTop, setIsHoveredTop] = useState(false)

  // Reveal header when mouse moves into top 40px of screen
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 50) {
        setIsHoveredTop(true)
      } else if (e.clientY > 100) {
        setIsHoveredTop(false)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const shouldHideHeader = isHeaderHidden && !isHoveredTop

  return (
    <div className="min-h-dvh flex flex-col bg-cinema-950 noise-overlay">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 border-b border-white/[0.06] bg-cinema-950/80 backdrop-blur-md transition-transform duration-300 ease-in-out ${
          shouldHideHeader ? '-translate-y-full shadow-none pointer-events-none' : 'translate-y-0 shadow-lg shadow-black/40'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex-shrink-0" aria-label="CineRiddle home">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            
            {location.pathname !== '/game' && (
              <Button
                id="nav-play-btn"
                variant="gold"
                size="sm"
                rightIcon={<span>▶</span>}
                onClick={() => navigate('/game')}
              >
                {t('playNow')}
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 bg-cinema-950/60 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span>© {new Date().getFullYear()} CineRiddle. {t('allRightsReserved')}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <Link to="/privacy" className="hover:text-gold-400 transition-colors">
              {t('privacyPolicy')}
            </Link>
            <Link to="/terms" className="hover:text-gold-400 transition-colors">
              {t('termsOfService')}
            </Link>
            <a
              href="https://github.com/ozanggnr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400/80 hover:text-gold-400 font-medium transition-colors flex items-center gap-1"
            >
              <span>{t('createdBy')}</span>
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
