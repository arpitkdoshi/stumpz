import type { ReactNode } from 'react'
import ModalProvider from '@/providers/modal-provider'
import { Toaster } from '@/components/ui/sonner'
import { LoadingProvider } from '@/context/loading-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <LoadingProvider>
        {children}
        <Toaster />
        <ModalProvider />
      </LoadingProvider>
    </>
  )
}
