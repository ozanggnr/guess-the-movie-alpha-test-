import { createContext, useContext, useState, type ReactNode } from 'react'

interface HeaderVisibilityContextType {
  isHeaderHidden: boolean
  setHeaderHidden: (hidden: boolean) => void
}

const HeaderVisibilityContext = createContext<HeaderVisibilityContextType | undefined>(undefined)

export function HeaderVisibilityProvider({ children }: { children: ReactNode }) {
  const [isHeaderHidden, setHeaderHidden] = useState(false)

  return (
    <HeaderVisibilityContext.Provider value={{ isHeaderHidden, setHeaderHidden }}>
      {children}
    </HeaderVisibilityContext.Provider>
  )
}

export function useHeaderVisibility() {
  const context = useContext(HeaderVisibilityContext)
  if (!context) {
    throw new Error('useHeaderVisibility must be used within a HeaderVisibilityProvider')
  }
  return context
}
