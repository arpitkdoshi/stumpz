'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { Contact, Frame, Group, PieChart, Sliders } from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import Image from 'next/image'
import { useAdminStore } from '@/providers/admin-store-provider'
import { Combobox } from '@/components/ui/combobox'
import { createTournament } from '@/actions/tournament'
import { toast } from 'sonner'
import { getNextId } from '@/lib/utils'
import { NavOthers } from '@/components/nav-other'

const data = {
  navMain: [
    {
      title: 'Settings',
      url: '/admin/tournament',
      icon: Sliders,
    },
    {
      title: 'Teams',
      url: '/admin/teams',
      icon: Group,
    },
    {
      title: 'Players',
      url: '/admin/players',
      icon: Contact,
    },
  ],
  projects: [
    {
      name: 'Auction',
      url: '/admin/auction',
      icon: Frame,
    },
    {
      name: 'Match',
      url: '/admin/match',
      icon: PieChart,
    },
  ],
  other: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    tournaments,
    selectedTournamentId,
    setSelectedTournamentId,
    addNewTournament,
  } = useAdminStore(store => store)
  const [k, setK] = useState('')
  const addTournament = async (name: string) => {
    const resp = await createTournament({ name })
    if (resp && resp.success) {
      const id = resp.data as string
      addNewTournament({ label: name, value: id })
      toast.error(`${name} created.`)
    } else {
      toast.error('Something went wrong!\nError creating Tournament')
    }
  }
  useEffect(() => {
    setK(getNextId())
  }, [tournaments])

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <Image
                    src={'/images/logos/stumpz2.svg'}
                    alt={'Logo'}
                    width={32}
                    height={32}
                  />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Stumpz</span>
                  <span className='truncate text-xs'>admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className='mt-4 mx-2'>
          <Combobox
            key={k}
            options={tournaments}
            placeholder='Select a tournament'
            selected={selectedTournamentId}
            onChange={v => setSelectedTournamentId(v.value)}
            onCreate={name => {
              addTournament(name).then()
            }}
          />
          {selectedTournamentId !== '' && (
            <>
              <NavMain items={data.navMain} />
              <NavProjects projects={data.projects} />
              <NavOthers others={data.other} />
            </>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
