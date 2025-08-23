'use server'

import React, { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AdminStoreProvider } from '@/providers/admin-store-provider'
import { readAllTournaments } from '@/actions/tournament'
import { ComboboxOptions } from '@/components/ui/combobox'
import { TSingleTournament } from '@/lib/types'

const LayoutAdmin = async ({ children }: { children: ReactNode }) => {
  const response = await readAllTournaments()
  const tournaments: ComboboxOptions[] = []
  if (response.success) {
    const allTour = response.data as TSingleTournament[]
    allTour.forEach(tournament => {
      tournaments.push({ label: tournament.name, value: tournament.id })
    })
  }
  return (
    <AdminStoreProvider initialVal={{ tournaments }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1' />
              <Separator
                orientation='vertical'
                className='mr-2 data-[orientation=vertical]:h-4'
              />
            </div>
          </header>
          <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AdminStoreProvider>
  )
}

export default LayoutAdmin
