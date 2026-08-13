import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { Language } from '@/i18n/translations'
import { Globe, ChevronDown } from 'lucide-react'

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative inline-block text-left z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 text-xs font-medium transition-colors"
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-gold-400" />
        <span>{currentLang.flag} {currentLang.code.toUpperCase()}</span>
        <ChevronDown className="w-3 h-3 text-white/40" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-cinema-900 border border-white/10 shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors ${
                language === lang.code
                  ? 'bg-gold-500/20 text-gold-400 font-bold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
