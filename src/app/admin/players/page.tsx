'use client'
import React, { useEffect, useState } from 'react'
import { useAdminStore } from '@/providers/admin-store-provider'
import { useLoading } from '@/context/loading-context'
import { TSinglePlayer, TSingleTournament } from '@/lib/types'
import {
  deletePlayer,
  readAllTournamentPlayers,
  readPlayer,
} from '@/actions/player'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ComboOption,
  MultiSelectComboBox,
} from '@/components/ui/multiselect-combobox'
import { PlusCircle, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import PlayerForm from '@/app/admin/players/components/player-form'
import { playerRoleVal } from '@/db/schema'
import { toast } from 'sonner'
import { getNextId } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { readTournament } from '@/actions/tournament'

// Role Options Array
const roleOptions: ComboOption[] = playerRoleVal.map(r => ({
  label: r,
  value: r,
}))

export default function PlayersPage() {
  const [search, setSearch] = React.useState('')
  const [k, setK] = useState('')
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([])
  const [tournament, setTournament] = useState<TSingleTournament | null>(null)
  const [selectedPlayer, setSelectedPlayer] =
    React.useState<TSinglePlayer | null>(null)
  const [isNewUI, setIsNewUI] = React.useState(false)
  const [players, setPlayers] = useState<TSinglePlayer[] | null>(null)
  const filtered = players
    ? players.filter(p => {
        const matchesName = p.name!.toLowerCase().includes(search.toLowerCase())
        const matchesRole =
          selectedRoles.length === 0 || selectedRoles.includes(p.role!)
        return matchesName && matchesRole
      })
    : []

  const { selectedTournamentId } = useAdminStore(store => store)
  const { setLoading } = useLoading()

  const getDetails = async (tournamentId: string) => {
    const resp = await readAllTournamentPlayers(tournamentId)
    if (resp.success) {
      const r = resp.data as TSinglePlayer[]
      setPlayers(r)
    }
    const r1 = await readTournament(tournamentId)
    if (r1.success) {
      const rr = r1.data as TSingleTournament
      setTournament(rr)
    }
  }
  useEffect(() => {
    if (selectedTournamentId !== '') {
      setLoading(true)
      getDetails(selectedTournamentId).then(() => setLoading(false))
    }
  }, [selectedTournamentId])

  useEffect(() => {
    if (selectedPlayer) setK(getNextId())
  }, [selectedPlayer])

  if (selectedTournamentId === '') {
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

  async function handleChangeInSelected(id: string, isNew: boolean) {
    setLoading(true)
    const resp = await readPlayer(id)
    if (resp.success) {
      const n = resp.data as TSinglePlayer
      if (isNew) {
        setPlayers(prev => {
          if (prev) {
            const s = prev as TSinglePlayer[]
            return [n, ...s]
          }
          return [n]
        })
        setIsNewUI(false)
        setSelectedPlayer(n)
      } else {
        setPlayers(prev => {
          if (prev) {
            return prev.map(t => {
              if (t.id === n.id) return n
              return t
            })
          }
          return [n]
        })
      }
    } else {
      toast.error('Something went wrong!, Unable to get new Player')
    }
    setLoading(false)
  }

  if (!players || !tournament) return null
  return (
    <div>
      <h2 className={'font-bold text-xl px-6'}>Tournament Players</h2>
      <div className='grid grid-cols-3 gap-4 p-6'>
        <div className='col-span-3 flex gap-2 items-baseline mb-2'>
          <Button
            variant={'outline'}
            size={'icon'}
            className={'mt-auto'}
            disabled={tournament && tournament.totalTeams === players.length}
            onClick={() => setIsNewUI(true)}
          >
            <PlusCircle />
          </Button>
          {/*<Button*/}
          {/*  variant={'outline'}*/}
          {/*  size={'icon'}*/}
          {/*  className={'mt-auto'}*/}
          {/*  disabled={tournament && tournament.totalTeams === players.length}*/}
          {/*>*/}
          {/*  <Import />*/}
          {/*</Button>*/}
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
        <>
          {isNewUI ? (
            <div className={'col-span-3'}>
              <PlayerForm
                onCancelAction={() => {
                  setIsNewUI(false)
                  setSelectedPlayer(null)
                }}
                player={null}
                updateUIPlayerAction={handleChangeInSelected}
              />
            </div>
          ) : (
            <>
              {/* LEFT: Player List + Filters */}
              {filtered.length > 0 ? (
                <>
                  <div className='col-span-1'>
                    <div className='flex justify-end items-center'>
                      <p className={'text-xs text-muted-foreground pr-2'}>
                        {`${players.length} / ${tournament.totalTeams! * tournament.playersPerTeam!}`}
                      </p>
                    </div>
                    <div className='border rounded-md overflow-hidden'>
                      {filtered.map(player => (
                        <div
                          onClick={() => setSelectedPlayer(player)}
                          className={`px-3 py-2 cursor-pointer flex justify-between items-center hover:bg-muted ${selectedPlayer?.id === player.id ? 'bg-muted' : ''}`}
                          key={player.id}
                        >
                          <div className={'flex flex-col gap-2'}>
                            <p className='font-medium'>{player.name}</p>
                            <p className='text-xs text-muted-foreground'>
                              {player.role}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='ghost'
                                className={'hover:bg-red-100'}
                              >
                                <Trash2 className={'size-4'} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the player and related
                                  data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>No</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    setLoading(true)
                                    const resp = await deletePlayer(player.id)
                                    if (resp.success) {
                                      toast.success(
                                        `${player.name} deleted successfully.`,
                                      )
                                      setPlayers(prev => {
                                        if (prev) {
                                          return [
                                            ...prev.filter(
                                              p => p.id !== player.id,
                                            ),
                                          ]
                                        }
                                        return null
                                      })
                                      setSelectedPlayer(null)
                                    } else {
                                      toast.error(
                                        'Something went wrong! Unable to delete the tournament',
                                      )
                                    }
                                    setLoading(false)
                                  }}
                                >
                                  Yes
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                players.length > 0 && <p>No Players Found..</p>
              )}
              {/* RIGHT: Player Form */}
              {filtered.length > 0 ? (
                <div className='col-span-2'>
                  {players.length > 0 ? (
                    <>
                      {selectedPlayer ? (
                        <PlayerForm
                          key={k}
                          onCancelAction={() => setSelectedPlayer(null)}
                          player={selectedPlayer}
                          updateUIPlayerAction={handleChangeInSelected}
                        />
                      ) : (
                        <p className='text-muted-foreground'>
                          Select a player to view details or create new a player
                        </p>
                      )}
                    </>
                  ) : (
                    <p className='text-muted-foreground'>Create new player</p>
                  )}
                </div>
              ) : null}
            </>
          )}
        </>
      </div>
    </div>
  )
}
