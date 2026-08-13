import { useLanguage } from '@/context/LanguageContext'
import Logo from '@/components/ui/Logo'
import { ShieldCheck, Lock, Eye, Server } from 'lucide-react'

export default function PrivacyPage() {
  const { t } = useLanguage()

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 text-white">
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <Logo size="lg" showTagline />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mt-2 text-shimmer">
          {t('privacyPolicy')}
        </h1>
        <p className="text-white/40 text-sm mt-2">Last updated: August 2026</p>
      </div>

      <div className="glass-card p-6 sm:p-10 space-y-8 text-white/80 leading-relaxed text-sm sm:text-base border border-white/10">
        <section className="space-y-3">
          <div className="flex items-center gap-3 text-gold-400 font-bold text-lg sm:text-xl">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <h2>Overview</h2>
          </div>
          <p>
            Welcome to <strong className="text-white">CineRiddle</strong>! We value your privacy and are committed to protecting your personal information while providing an engaging movie guessing experience.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-gold-400 font-bold text-lg sm:text-xl">
            <Lock className="w-6 h-6 shrink-0" />
            <h2>Data Collection & Local Storage</h2>
          </div>
          <p>
            CineRiddle operates with a <strong>privacy-first model</strong>. We do not require account creation, email registration, or personal identifier submissions to play.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-white/60 pl-2">
            <li><strong>Session Progress & Scores:</strong> Stored strictly in your browser's <code className="text-gold-400">localStorage</code>.</li>
            <li><strong>Language Preferences:</strong> Stored locally to remember your preferred language selection (English, Turkish, Spanish).</li>
            <li><strong>No Third-Party Tracking:</strong> We do not use invasive tracking cookies or sell user data to advertisers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-gold-400 font-bold text-lg sm:text-xl">
            <Eye className="w-6 h-6 shrink-0" />
            <h2>YouTube Video Player & Embeds</h2>
          </div>
          <p>
            Our movie clips are streamed via the official YouTube IFrame API. When playing video clips, YouTube may set standard player cookies in accordance with Google's Privacy Policy.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 text-gold-400 font-bold text-lg sm:text-xl">
            <Server className="w-6 h-6 shrink-0" />
            <h2>Contact & Developer Information</h2>
          </div>
          <p>
            If you have questions regarding this application or privacy practices, feel free to reach out via GitHub:
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
