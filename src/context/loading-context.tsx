// context/LoadingContext.tsx
'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'

type LoadingContextType = {
  isLoading: boolean
  setLoading: (value: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading }}>
      {children}
      {isLoading && (
        <div
          className={
            'absolute top-0 left-0 bg-white h-screen w-full flex justify-center items-center z-[12]'
          }
        >
          <div className='loader'></div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
