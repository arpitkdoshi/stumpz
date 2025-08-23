// src/providers/singleTournament-store-provider.tsx
'use client'

import { createContext, type ReactNode, useContext, useRef } from 'react'
import { useStore } from 'zustand'

import {
  AdminState,
  type AdminStore,
  createAdminStore,
} from '@/store/admin-store'

export type AdminStoreApi = ReturnType<typeof createAdminStore>

export const AdminStoreContext = createContext<AdminStoreApi | undefined>(
  undefined,
)

export interface AdminStoreProviderProps {
  children: ReactNode
  initialVal: Partial<AdminState>
}

export const AdminStoreProvider = ({
  children,
  initialVal,
}: AdminStoreProviderProps) => {
  const storeRef = useRef<AdminStoreApi>(null)
  if (!storeRef.current) {
    storeRef.current = createAdminStore(initialVal)
  }

  return (
    <AdminStoreContext.Provider value={storeRef.current}>
      {children}
    </AdminStoreContext.Provider>
  )
}

export const useAdminStore = <T,>(selector: (store: AdminStore) => T): T => {
  const adminStoreContext = useContext(AdminStoreContext)

  if (!adminStoreContext) {
    throw new Error(`useAdminStore must be used within AdminStoreProvider`)
  }

  return useStore(adminStoreContext, selector)
}
