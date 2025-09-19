'use client'
import React, { useEffect, useId, useState } from 'react'
import { useAdminStore } from '@/providers/admin-store-provider'
import { useLoading } from '@/context/loading-context'
import { TSingleAuction, TSinglePlayer, TSingleTournament } from '@/lib/types'
import { readTournament } from '@/actions/tournament'
import { createAuction, readAuction, updateAuction } from '@/actions/auction'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { AuctionStatusValues, ChangeKeyValues, TAuctionMeta } from '@/db/schema'
import Link from 'next/link'

import { ExternalLink, Pause, Play } from 'lucide-react'
import { readAllTournamentPlayers } from '@/actions/player'

export default function AuctionPage() {
  const id = useId()

  const { selectedTournamentId } = useAdminStore(store => store)
  const { setLoading } = useLoading()
  const [tournament, setTournament] = useState<TSingleTournament | null>(null)
  const [auction, setAuction] = useState<TSingleAuction | null>(null)
  const [auctionId, setAuctionId] = useState('')
  const [groups, setGroups] = useState<{ label: string; value: string }[]>([])
  const [auctionMeta, setAuctionMeta] = useState<TAuctionMeta | null>(null)
  const [allPlayers, setAllPlayers] = useState<TSinglePlayer[]>([])
  const [currentPlayers, setCurrentPlayers] = useState<TSinglePlayer[]>([])
  const [rd, setRd] = useState<string>('')
  const [cp, setCp] = useState<string>('')
  const getTournament = async (id: string) => {
    const resp = await readTournament(id)
    if (resp.success) {
      const r = resp.data as TSingleTournament
      if (r.currentAuctionId && r.currentAuctionId !== '') {
        setAuctionId(r.currentAuctionId)
      }
      const options = r.otherSettings ? r.otherSettings.groups : []
      setTournament(r)
      setGroups(options.map(item => ({ label: item, value: item })))
      const r3 = await readAllTournamentPlayers(id)
      if (r3.success) {
        setAllPlayers(r3.data as TSinglePlayer[])
      }
    }
  }
  const getAuction = async () => {
    const r1 = await readAuction(auctionId)
    if (r1.success) {
      const r2 = r1.data as TSingleAuction
      setAuction(r2)
      setAuctionMeta(r2.auctionMeta)
      if (r2.auctionMeta)
        setRd(r2.auctionMeta.currentGroup ? r2.auctionMeta.currentGroup : '')
    }
  }
  useEffect(() => {
    if (auctionId !== '') {
      getAuction().then(() => {})
    }
  }, [auctionId])
  useEffect(() => {
    if (rd !== '') {
      setCurrentPlayers(allPlayers.filter(p => p.group === rd))
    }
  }, [rd])
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

  async function updStatus(status: AuctionStatusValues) {
    await updateAuction({
      id: auction ? auction.id : '',
      status,
      changeKey: 'STATUS_CHANGE',
    })
    getAuction().then(() => {})
  }

  async function updMeta(
    auctionMeta: TAuctionMeta,
    changeKey: ChangeKeyValues,
  ) {
    await updateAuction({
      id: auction ? auction.id : '',
      auctionMeta,
      changeKey,
    })
    getAuction().then(() => {})
  }

  if (!tournament) return null
  if (!auctionMeta) return null
  return (
    <div className={' w-full container mx-auto px-10'}>
      <div className='flex w-full justify-between items-center mb-4'>
        <h2 className={'font-bold text-xl'}>Auction</h2>
      </div>
      {auction ? (
        <div className={'grid grid-cols-6 gap-6'}>
          <Card className={'col-span-2 h-fit'}>
            <CardContent>
              <div className='flex justify-end items-center'>
                <Button asChild variant={'link'}>
                  <Link
                    href={`/live/auction?t=${selectedTournamentId}&a=${auction.id}`}
                    target={`_blank`}
                  >
                    Open Live
                    <ExternalLink />
                  </Link>
                </Button>
              </div>
              <div className='flex justify-between items-center gap-6 mt-4'>
                <h2 className={'text-sm'}>
                  Auction Status:{' '}
                  <span className={'font-semibold text-lg'}>
                    {auction.status}
                  </span>
                </h2>
                {auction.status === 'Not Started' && (
                  <Button
                    onClick={() => updStatus('In Progress')}
                    variant={'outline'}
                  >
                    <span>
                      <Play />
                    </span>
                  </Button>
                )}
                {auction.status === 'In Progress' && (
                  <Button
                    onClick={() => updStatus('Paused')}
                    variant={'outline'}
                  >
                    <span>
                      <Pause />
                    </span>
                  </Button>
                )}
                {auction.status === 'Paused' && (
                  <Button
                    onClick={() => updStatus('In Progress')}
                    variant={'outline'}
                  >
                    <span>
                      <Play />
                    </span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className={'col-span-2'}>
            <CardContent>
              <fieldset className='space-y-4'>
                <legend className='text-foreground text-sm leading-none font-medium'>
                  Groups
                </legend>
                <RadioGroup
                  className='flex flex-wrap gap-2'
                  value={rd}
                  onValueChange={s => setRd(s)}
                >
                  {groups.map(item => (
                    <div
                      key={`${id}-${item.value}`}
                      className='border-input has-data-[state=checked]:border-primary/50 relative flex-1 flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none'
                    >
                      <div className='flex items-center gap-2'>
                        <RadioGroupItem
                          disabled={auctionMeta.currentGroup !== ''}
                          id={`${id}-${item.value}`}
                          value={item.value}
                          className='after:absolute after:inset-0'
                        />
                        <Label htmlFor={`${id}-${item.value}`}>
                          {item.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                <Button
                  className={'w-full'}
                  disabled={rd === '' || auctionMeta.currentGroup !== ''}
                  onClick={() => {
                    updMeta(
                      { ...auctionMeta, currentGroup: rd },
                      'GROUP_CHANGE',
                    )
                  }}
                >
                  Save
                </Button>
              </fieldset>
            </CardContent>
          </Card>
          <Card className={'col-span-2'}>
            <CardContent>
              <fieldset className='space-y-4'>
                <legend className='text-foreground text-sm leading-none font-medium'>
                  Players
                </legend>
                {auctionMeta.currentGroup === '' ? (
                  <div
                    className={'w-full h-full flex items-center justify-center'}
                  >
                    Set the Group to see the players
                  </div>
                ) : currentPlayers.length > 0 ? (
                  <>
                    <RadioGroup
                      className='flex flex-wrap gap-2'
                      value={cp}
                      onValueChange={s => setCp(s)}
                    >
                      {currentPlayers.map(item => (
                        <div
                          key={`${id}-${item.name}`}
                          className='border-input has-data-[state=checked]:border-primary/50 relative flex-1 flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none'
                        >
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem
                              id={`${id}-${item.name}`}
                              value={item.id}
                              disabled={auctionMeta.currentPlayer.name !== ''}
                              className='after:absolute after:inset-0'
                            />
                            <Label htmlFor={`${id}-${item.name}`}>
                              {item.name}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button
                      className={'w-full'}
                      disabled={
                        cp === '' || auctionMeta.currentPlayer.name !== ''
                      }
                      onClick={() => {
                        const { id, name, img_url, role, basePrice, ...rest } =
                          allPlayers.filter(a => a.id === cp)[0]
                        updMeta(
                          {
                            ...auctionMeta,
                            currentPlayer: {
                              name,
                              id,
                              img_url: img_url ?? '',
                              role,
                            },
                            currentBid: basePrice ?? 0,
                            totalPlayers: currentPlayers.length,
                            soldPlayers: currentPlayers.filter(
                              s => s.teamId !== '',
                            ).length,
                          },
                          'PLAYER_CHANGE',
                        )
                      }}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <div
                    className={'w-full h-full flex items-center justify-center'}
                  >
                    No Players found in this group
                  </div>
                )}
              </fieldset>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Button
          onClick={async () => {
            const resp = await createAuction({
              tournamentId: selectedTournamentId,
            })
            if (resp.success) {
              setAuction(resp.data as TSingleAuction)
            } else {
              toast.error(resp.error)
            }
          }}
        >
          Create new Auction
        </Button>
      )}
    </div>
  )
}
