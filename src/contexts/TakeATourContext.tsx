import React, { createContext, useContext, useState, type ReactNode } from 'react'

interface TakeATourContextType {
  isOpen: boolean
  openTakeATour: () => void
  closeTakeATour: () => void
}

const TakeATourContext = createContext<TakeATourContextType | undefined>(undefined)

export const TakeATourProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openTakeATour = () => setIsOpen(true)
  const closeTakeATour = () => setIsOpen(false)

  return (
    <TakeATourContext.Provider value={{ isOpen, openTakeATour, closeTakeATour }}>
      {children}
    </TakeATourContext.Provider>
  )
}

export const useTakeATour = () => {
  const context = useContext(TakeATourContext)
  if (!context) {
    throw new Error('useTakeATour must be used within a TakeATourProvider')
  }
  return context
}

