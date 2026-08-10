import { Link, Outlet } from 'react-router-dom'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

export default function RootLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-cinema-950 noise-overlay">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="relative z-50 border-b border-white/[0.04]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex-shrink-0" aria-label="MovieGuess home">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            {/* Nav items will be populated in later phases */}
            <Button
              id="nav-play-btn"
              variant="gold"
              size="sm"
              rightIcon={<span>▶</span>}
            >
              Play Now
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} MovieGuess. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
