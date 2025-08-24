'use client'
import React, { useEffect, useState } from 'react'
import { useAdminStore } from '@/providers/admin-store-provider'
import { useLoading } from '@/context/loading-context'
import { TSinglePlayer } from '@/lib/types'
import { readAllTournamentPlayers } from '@/actions/player'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ComboOption,
  MultiSelectComboBox,
} from '@/components/ui/multiselect-combobox'
import { Import, PlusCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

type Player = {
  id: number
  name: string
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper'
  team: string
}

const allPlayers: Player[] = [
  { id: 1, name: 'Virat Kohli', role: 'Batsman', team: 'India' },
  { id: 2, name: 'Jasprit Bumrah', role: 'Bowler', team: 'India' },
  { id: 3, name: 'Hardik Pandya', role: 'All-rounder', team: 'India' },
  { id: 4, name: 'MS Dhoni', role: 'Wicketkeeper', team: 'India' },
]

const roles = ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper']

// Role Options Array
const roleOptions: ComboOption[] = roles.map(r => ({ label: r, value: r }))

const PlayersPage = () => {
  const [search, setSearch] = React.useState('')
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([])
  const [selectedPlayer, setSelectedPlayer] = React.useState<Player | null>(
    null,
  )

  const filtered = allPlayers.filter(p => {
    const matchesName = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesRole =
      selectedRoles.length === 0 || selectedRoles.includes(p.role)
    return matchesName && matchesRole
  })

  const { selectedTournament } = useAdminStore(store => store)
  const { setLoading } = useLoading()
  const [players, setPlayers] = useState<TSinglePlayer[] | null>(null)
  const getTournamentPlayers = async (tournamentId: string) => {
    const resp = await readAllTournamentPlayers(tournamentId)
    if (resp.success) {
      const r = resp.data as TSinglePlayer[]
      setPlayers(r)
    }
  }
  useEffect(() => {
    if (selectedTournament !== '') {
      setLoading(true)
      getTournamentPlayers(selectedTournament).then(() => setLoading(false))
    }
  }, [selectedTournament])
  if (selectedTournament === '') {
    return (
      <div
        className={
          'w-full h-full flex justify-center items-center text-2xl font-bold flex-col'
        }
      >
        No Tournament selected.
        <div className={'font-normal text-sm text-muted-foreground'}>
          Select a tournament, to view the details
        </div>
      </div>
    )
  }
  if (!players) return null

  return (
    <div>
      <h2 className={'font-bold text-xl px-6'}>Tournament Players</h2>
      <div className='grid grid-cols-3 gap-4 p-6'>
        <div className='col-span-3 flex gap-2 items-baseline mb-2'>
          <Button variant={'outline'} size={'icon'} className={'mt-auto'}>
            <PlusCircle />
          </Button>
          <Button variant={'outline'} size={'icon'} className={'mt-auto'}>
            <Import />
          </Button>
          <Separator
            orientation='vertical'
            className='mx-2 data-[orientation=vertical]:h-9 mt-auto'
          />
          <Input
            placeholder='Filter by name...'
            value={search}
            className={'w-fit mt-auto'}
            onChange={e => setSearch(e.target.value)}
          />
          <MultiSelectComboBox
            options={roleOptions}
            selected={selectedRoles}
            onChange={r => {
              setSelectedRoles(r)
            }}
          />
        </div>
        {/* LEFT: Player List + Filters */}
        {filtered.length > 0 ? (
          <>
            <div className='col-span-1 space-y-4'>
              <div className='border rounded-md overflow-hidden'>
                {filtered.map(player => (
                  <div
                    key={player.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-muted ${selectedPlayer?.id === player.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <p className='font-medium'>{player.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {player.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Button className={'m-2 w-[95.5%]'}>Create Player</Button>
        )}

        {/* RIGHT: Player Form */}
        <div className='col-span-2'>
          {selectedPlayer ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Player</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Name</Label>
                  <Input value={selectedPlayer.name} disabled />
                </div>

                <div className='space-y-2'>
                  <Label>Role</Label>
                  <Input value={selectedPlayer.role} disabled />
                </div>

                <div className='space-y-2'>
                  <Label>Team</Label>
                  <Input value={selectedPlayer.team} disabled />
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          ) : (
            <p className='text-muted-foreground'>
              Select a player to view details
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayersPage
