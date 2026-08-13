import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Language, type TranslationKeys } from '@/i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof TranslationKeys, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'cineriddle_language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language
    if (saved && (saved === 'en' || saved === 'tr' || saved === 'es')) {
      return saved
    }
    const browserLang = navigator.language.slice(0, 2)
    if (browserLang === 'tr') return 'tr'
    if (browserLang === 'es') return 'es'
    return 'en'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }

  const t = (key: keyof TranslationKeys, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en
    let str = dict[key] || translations.en[key] || key
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val))
      })
    }
    return str
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
