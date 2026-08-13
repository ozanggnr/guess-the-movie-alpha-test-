import { useLanguage } from '@/context/LanguageContext'
import Logo from '@/components/ui/Logo'
import { FileText, Scale, Film, Code } from 'lucide-react'

export default function TermsPage() {
  const { t } = useLanguage()

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 text-white">
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <Logo size="lg" showTagline />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mt-2 text-shimmer">
          {t('termsOfService')}
        </h1>
        <p className="text-white/40 text-sm mt-2">Effective date: August 2026</p>
      </div>

      <div className="glass-card p-6 sm:p-10 space-y-8 text-white/80 leading-relaxed text-sm sm:text-base border border-white/10">
        <section className="space-y-3">
          <div className="flex items-center gap-3 text-gold-400 font-bold text-lg sm:text-xl">
            <FileText className="w-6 h-6 shrink-0" />
            <h2>Acceptance of Terms</h2>
          </div>
          <p>
            By playing <strong className="text-white">CineRiddle</strong>, you agree to these Terms of Service. CineRiddle is a free, web-based film trivia and game platform designed for cinematic entertainment and education.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-gold-400 font-bold text-lg sm:text-xl">
            <Film className="w-6 h-6 shrink-0" />
            <h2>Content & Media Attribution</h2>
          </div>
          <p>
            All video clips are served directly from YouTube using embedded media players under Fair Use and public domain distribution guidelines. All copyrights and trademarks belong to their respective original studios and creators.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-gold-400 font-bold text-lg sm:text-xl">
            <Scale className="w-6 h-6 shrink-0" />
            <h2>Fair Gameplay Guidelines</h2>
          </div>
          <p>
            Players are encouraged to enjoy the challenge of guessing movies within the allotted clip duration windows (1s, 3s, 5s, 10s). The automated scoring system rewards speed and accuracy.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-gold-400 font-bold text-lg sm:text-xl">
            <Code className="w-6 h-6 shrink-0" />
            <h2>Open Source & Attribution</h2>
          </div>
          <p>
            CineRiddle is built with love by <strong className="text-white">ozanggnr</strong>. Visit the official GitHub profile for repository details, updates, and contributions:
          </p>
          <a
            href="https://github.com/ozanggnr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
          >
            github.com/ozanggnr →
          </a>
        </section>
      </div>
    </div>
  )
}
