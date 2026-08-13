import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { useLanguage } from '@/context/LanguageContext'
import { ROUND_DURATIONS, ROUND_SCORES } from '@/types'

function FilmStrip({ position }: { position: 'left' | 'right' }) {
  const holes = Array.from({ length: 12 })
  return (
    <div
      className={`absolute top-0 bottom-0 ${position === 'left' ? 'left-0' : 'right-0'} w-8 opacity-10 hidden lg:flex flex-col justify-around items-center py-4`}
      aria-hidden
    >
      {holes.map((_, i) => (
        <div key={i} className="w-4 h-4 rounded-sm border border-white/40 bg-cinema-950" />
      ))}
    </div>
  )
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-black text-shimmer mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-white/40 uppercase tracking-widest font-medium">{label}</div>
    </div>
  )
}

function RoundCard({
  round,
  seconds,
  score,
  delay,
}: {
  round: number
  seconds: number
  score: number
  delay: number
}) {
  const { t } = useLanguage()
  return (
    <div
      className="glass-card p-5 flex flex-col items-center gap-3 animate-fade-up opacity-0-start hover:border-gold-500/30 transition-colors duration-300 border border-white/10"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-cinema-950 font-black text-sm shadow-gold-sm">
        {round}
      </div>
      <div>
        <div className="text-white font-bold text-center">
          {t('secondsClip', { seconds })}
        </div>
        <div className="text-gold-400/80 font-mono text-xs text-center mt-0.5 font-bold">
          {score.toLocaleString()} pts
        </div>
      </div>
    </div>
  )
}

function FloatingPoster({
  emoji,
  top,
  left,
  delay,
  rotate,
}: {
  emoji: string
  top: string
  left: string
  delay: number
  rotate: number
}) {
  return (
    <div
      className="absolute hidden xl:block animate-float opacity-25 select-none pointer-events-none"
      style={{ top, left, animationDelay: `${delay}ms`, transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <div className="glass-card p-3 text-4xl border border-white/10">{emoji}</div>
    </div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [_mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Ambient glows */}
      <div
        className="spotlight w-[600px] h-[600px] bg-gold-500/10 top-[-200px] left-1/2 -translate-x-1/2"
        aria-hidden
      />
      <div
        className="spotlight w-[400px] h-[400px] bg-amber-500/10 top-[30%] left-[-100px]"
        aria-hidden
      />
      <div
        className="spotlight w-[350px] h-[350px] bg-gold-600/10 top-[20%] right-[-80px]"
        aria-hidden
      />

      {/* Film strips */}
      <FilmStrip position="left" />
      <FilmStrip position="right" />

      {/* Floating posters */}
      <FloatingPoster emoji="🎬" top="15%" left="8%" delay={0} rotate={-8} />
      <FloatingPoster emoji="🍿" top="50%" left="5%" delay={1000} rotate={5} />
      <FloatingPoster emoji="🎭" top="70%" left="88%" delay={500} rotate={-5} />
      <FloatingPoster emoji="🏆" top="20%" left="85%" delay={1500} rotate={7} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="text-center mb-20" aria-labelledby="hero-heading">
          <div
            className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 animate-fade-in opacity-0-start border border-gold-500/20"
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse-slow" />
            <span className="text-gold-400 text-xs font-semibold tracking-widest uppercase">
              {t('heroBadge')}
            </span>
          </div>

          <h1
            id="hero-heading"
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6 animate-fade-up opacity-0-start"
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            <span className="text-white">{t('heroTitleLine1')}</span>
            <br />
            <span className="text-shimmer">{t('heroTitleLine2')}</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up opacity-0-start"
            style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
          >
            {t('heroSubtitle')}
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0-start"
            style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
          >
            <Button
              id="hero-play-btn"
              variant="gold"
              size="xl"
              leftIcon={<span className="text-xl">▶</span>}
              className="animate-glow w-full sm:w-auto"
              onClick={() => navigate('/game')}
            >
              {t('heroCtaPlay')}
            </Button>
            <Button
              id="hero-how-btn"
              variant="secondary"
              size="xl"
              className="w-full sm:w-auto"
              onClick={() =>
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {t('heroCtaHow')}
            </Button>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <div
          className="glass-card w-full max-w-2xl px-8 py-6 grid grid-cols-3 gap-6 mb-20 animate-fade-up opacity-0-start border border-white/10"
          style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
        >
          <AnimatedStat value="100+" label={t('statMovies')} />
          <AnimatedStat value="4" label={t('statRounds')} />
          <AnimatedStat value="1s" label={t('statFirstClip')} />
        </div>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="w-full mb-20" aria-labelledby="how-it-works-heading">
          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl font-bold text-center mb-3 animate-fade-up opacity-0-start text-white"
            style={{ animationDelay: '650ms', animationFillMode: 'forwards' }}
          >
            {t('howItWorksTitle')}
          </h2>
          <p
            className="text-white/40 text-center mb-10 animate-fade-up opacity-0-start text-sm"
            style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}
          >
            {t('howItWorksSub')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(ROUND_DURATIONS).map(([round, seconds]) => (
              <RoundCard
                key={round}
                round={Number(round)}
                seconds={seconds}
                score={ROUND_SCORES[Number(round)]}
                delay={700 + Number(round) * 80}
              />
            ))}
          </div>
        </section>

        {/* ── Feature highlights ───────────────────────────────────────────── */}
        <section className="w-full mb-20" aria-labelledby="features-heading">
          <h2
            id="features-heading"
            className="text-2xl sm:text-3xl font-bold text-center mb-10 animate-fade-up opacity-0-start text-white"
            style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}
          >
            {t('featuresTitle')}
          </h2>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: '🎬',
                title: t('feature1Title'),
                desc: t('feature1Desc'),
                delay: 950,
              },
              {
                icon: '⏱',
                title: t('feature2Title'),
                desc: t('feature2Desc'),
                delay: 1050,
              },
              {
                icon: '🏆',
                title: t('feature3Title'),
                desc: t('feature3Desc'),
                delay: 1150,
              },
            ].map(feature => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:border-gold-500/30 transition-all duration-300 group animate-fade-up opacity-0-start border border-white/10"
                style={{ animationDelay: `${feature.delay}ms`, animationFillMode: 'forwards' }}
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA Banner ─────────────────────────────────────────────── */}
        <section
          className="w-full glass-card p-10 sm:p-14 text-center relative overflow-hidden animate-fade-up opacity-0-start border border-gold-500/30 shadow-gold-sm"
          style={{ animationDelay: '1200ms', animationFillMode: 'forwards' }}
          aria-labelledby="cta-heading"
        >
          <div
            className="spotlight w-[300px] h-[300px] bg-gold-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            aria-hidden
          />

          <div className="relative z-10">
            <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-3">
              {t('ctaBannerSub')}
            </p>
            <h2
              id="cta-heading"
              className="text-3xl sm:text-5xl font-black mb-6 text-white leading-tight"
            >
              {t('ctaBannerTitle')}
            </h2>
            <Button
              id="cta-play-btn"
              variant="gold"
              size="xl"
              leftIcon={<span className="text-xl">🎬</span>}
              className="mx-auto"
              onClick={() => navigate('/game')}
            >
              {t('ctaBannerButton')}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
