'use client'

import React, { useEffect, useState } from 'react'
import { useAdminStore } from '@/providers/admin-store-provider'
import TournamentForm from '@/app/admin/tournament/components/tournament-form'
import { TSingleTournament } from '@/lib/types'
import { deleteTournament, readTournament } from '@/actions/tournament'
import { useLoading } from '@/context/loading-context'
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
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getNextId } from '@/lib/utils'

const TournamentPage = () => {
  const { selectedTournamentId, rmTournament } = useAdminStore(store => store)
  const { setLoading } = useLoading()
  const [tournament, setTournament] = useState<TSingleTournament | null>(null)
  const [key, setKey] = useState('')
  const getTournament = async (id: string) => {
    const resp = await readTournament(id)
    if (resp.success) {
      const r = resp.data as TSingleTournament
      setKey(getNextId())
      setTournament(r)
    }
  }
  useEffect(() => {
    if (selectedTournamentId !== '') {
      setLoading(true)
      getTournament(selectedTournamentId).then(() => setLoading(false))
    }
  }, [selectedTournamentId])
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
  if (!tournament) return null
  return (
    <div className={' w-full container mx-auto px-10'}>
      <div className='flex w-full justify-between items-center mb-4'>
        <h2 className={'font-bold text-xl'}>Tournament Settings</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive'>Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                tournament and related data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  setLoading(true)
                  const resp = await deleteTournament(selectedTournamentId)
                  if (resp.success) {
                    toast.success(`${tournament.name} deleted successfully.`)
                    rmTournament()
                    setLoading(false)
                  } else {
                    toast.error(
                      'Something went wrong! Unable to delete the tournament',
                    )
                  }
                }}
              >
                Yes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <TournamentForm tournament={tournament} key={key} />
    </div>
  )
}

export default TournamentPage
