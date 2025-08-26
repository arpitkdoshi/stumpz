'use client'
import React, { useEffect, useState } from 'react'
import { useAdminStore } from '@/providers/admin-store-provider'
import { useLoading } from '@/context/loading-context'
import { TSingleTeam, TSingleTournament } from '@/lib/types'
import { deleteTeam, readAllTournamentTeams, readTeam } from '@/actions/team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
//import TeamForm from '@/app/admin/teams/components/team-form'
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
import TeamForm from '@/app/admin/teams/components/team-form'
import { readTournament } from '@/actions/tournament'

// Role Options Array
// const roleOptions: ComboOption[] = teamRoleVal.map(r => ({
//   label: r,
//   value: r,
// }))

export default function TeamsPage() {
  const [search, setSearch] = React.useState('')
  const [k, setK] = useState('')
  const [selectedTeam, setSelectedTeam] = React.useState<TSingleTeam | null>(
    null,
  )
  const [tournament, setTournament] = useState<TSingleTournament | null>(null)
  const [isNewUI, setIsNewUI] = React.useState(false)
  const [teams, setTeams] = useState<TSingleTeam[] | null>(null)
  const filtered = teams
    ? teams.filter(p => {
        const matchesName = p.name!.toLowerCase().includes(search.toLowerCase())
        // const matchesRole =
        //   selectedRoles.length === 0 || selectedRoles.includes(p.role!)
        return matchesName //&& matchesRole
      })
    : []

  const { selectedTournamentId } = useAdminStore(store => store)
  const { setLoading } = useLoading()

  const getDetailsForTeams = async (tournamentId: string) => {
    const resp = await readAllTournamentTeams(tournamentId)
    if (resp.success) {
      const r = resp.data as TSingleTeam[]
      setTeams(r)
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
      getDetailsForTeams(selectedTournamentId).then(() => setLoading(false))
    }
  }, [selectedTournamentId])

  useEffect(() => {
    if (selectedTeam) setK(getNextId())
  }, [selectedTeam])

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
    const resp = await readTeam(id)
    if (resp.success) {
      const n = resp.data as TSingleTeam
      if (isNew) {
        setTeams(prev => {
          if (prev) {
            const s = prev as TSingleTeam[]
            return [n, ...s]
          }
          return [n]
        })
        setIsNewUI(false)
        setSelectedTeam(n)
      } else {
        setTeams(prev => {
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
      toast.error('Something went wrong!, Unable to get new Team')
    }
    setLoading(false)
  }

  if (!teams || !tournament) return null
  return (
    <div>
      <h2 className={'font-bold text-xl px-6'}>Tournament Teams</h2>
      <div className='grid grid-cols-3 gap-4 p-6'>
        <div className='col-span-3 flex gap-2 items-baseline mb-2'>
          <Button
            variant={'outline'}
            size={'icon'}
            disabled={tournament && tournament.totalTeams === teams.length}
            className={'mt-auto'}
            onClick={() => setIsNewUI(true)}
          >
            <PlusCircle />
          </Button>
          {/*<Button*/}
          {/*  variant={'outline'}*/}
          {/*  size={'icon'}*/}
          {/*  className={'mt-auto'}*/}
          {/*  disabled={tournament && tournament.totalTeams === teams.length}*/}
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
          {/*<MultiSelectComboBox*/}
          {/*  options={roleOptions}*/}
          {/*  selected={selectedRoles}*/}
          {/*  onChange={r => {*/}
          {/*    setSelectedRoles(r)*/}
          {/*  }}*/}
          {/*/>*/}
        </div>
        <>
          {isNewUI ? (
            <div className={'col-span-3'}>
              <TeamForm
                onCancelAction={() => {
                  setIsNewUI(false)
                  setSelectedTeam(null)
                }}
                team={null}
                updateUITeamAction={handleChangeInSelected}
              />
            </div>
          ) : (
            <>
              {/* LEFT: Team List + Filters */}
              {filtered.length > 0 ? (
                <>
                  <div className='col-span-1'>
                    <div className='flex justify-end items-center'>
                      <p className={'text-xs text-muted-foreground pr-2'}>
                        {`${teams.length} / ${tournament.totalTeams}`}
                      </p>
                    </div>
                    <div className='border rounded-md overflow-hidden'>
                      {filtered.map(team => (
                        <div
                          onClick={() => setSelectedTeam(team)}
                          className={`px-3 py-2 cursor-pointer flex justify-between items-center hover:bg-muted ${selectedTeam?.id === team.id ? 'bg-muted' : ''}`}
                          key={team.id}
                        >
                          <div className='flex justify-center items-center gap-4'>
                            <div
                              className={'size-8 rounded-full'}
                              style={{ background: `${team.tShirtColor}` }}
                            />
                            <div className={'flex flex-col gap-2'}>
                              <p className='font-medium'>{team.name}</p>
                              <p className='text-xs text-muted-foreground'>
                                {team.ownerName}
                              </p>
                            </div>
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
                                  permanently delete the team and related data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>No</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    setLoading(true)
                                    const resp = await deleteTeam(team.id)
                                    if (resp.success) {
                                      toast.success(
                                        `${team.name} deleted successfully.`,
                                      )
                                      setTeams(prev => {
                                        if (prev) {
                                          return [
                                            ...prev.filter(
                                              p => p.id !== team.id,
                                            ),
                                          ]
                                        }
                                        return null
                                      })
                                      setSelectedTeam(null)
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
                teams.length > 0 && <p>No Teams Found..</p>
              )}
              {/* RIGHT: Team Form */}
              {filtered.length > 0 ? (
                <div className='col-span-2'>
                  {teams.length > 0 ? (
                    <>
                      {selectedTeam ? (
                        <TeamForm
                          key={k}
                          onCancelAction={() => setSelectedTeam(null)}
                          team={selectedTeam}
                          updateUITeamAction={handleChangeInSelected}
                        />
                      ) : (
                        <p className='text-muted-foreground'>
                          Select a team to view details or create new a team
                        </p>
                      )}
                    </>
                  ) : (
                    <p className='text-muted-foreground'>Create new team</p>
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
