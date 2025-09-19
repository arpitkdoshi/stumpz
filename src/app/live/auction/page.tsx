'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuctionStore } from '@/hooks/auction/useAuctionStore'
import { Response } from '@/app/api/auction/sse/route'
import { AuctionStatusValues, TAuctionMeta } from '@/db/schema'
import Image from 'next/image'
import { getNextId } from '@/lib/utils'
import { TSingleAuction, TSingleTournament } from '@/lib/types'
import { useLoading } from '@/context/loading-context'
import { motion } from 'motion/react'
import { TextGif } from '@/components/ui/text-gif'

type UIStructure = {
  loaded: boolean
  tournamentName: string
  tournamentLogo: string
  tournamentBanner: string
  auctionMeta: TAuctionMeta | null
  auctionStatus: AuctionStatusValues | ''
}

const testimonials = [
  {
    quote:
      "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
    name: 'Michael Rodriguez',
    designation: 'CTO at InnovateSphere',
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    quote:
      "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
    name: 'Emily Watson',
    designation: 'Operations Director at CloudScale',
    src: 'https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    quote:
      "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
    name: 'James Kim',
    designation: 'Engineering Lead at DataPro',
    src: 'https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    quote:
      'The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.',
    name: 'Lisa Thompson',
    designation: 'VP of Technology at FutureNet',
    src: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
]
const AuctionPage = () => {
  const { setLoading } = useLoading()
  const { bid, setState, lastUpdated } = useAuctionStore()
  const searchParams = useSearchParams()
  const tournamentId = searchParams.get('t')
  const auctionId = searchParams.get('a')
  const [updateUI, setUpdateUI] = useState(false)
  const [k, setK] = useState('')
  const [ui, setUi] = useState<UIStructure>({
    tournamentBanner: '',
    tournamentName: '',
    tournamentLogo: '',
    auctionStatus: '',
    auctionMeta: null,
    loaded: false,
  })

  const init = (tournament: TSingleTournament, auction: TSingleAuction) => {
    setUi(prev => ({
      ...prev,
      tournamentLogo: tournament!.logo_url ? tournament!.logo_url : '',
      tournamentName: tournament!.name,
      tournamentBanner: tournament!.banner_url ? tournament!.banner_url : '',
      auctionStatus: auction.status,
      auctionMeta: auction.auctionMeta,
      loaded: true,
    }))
  }
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/auction/sse?tournamentId=${tournamentId}&auctionId=${auctionId}`,
    )
    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) as Response
      if (data && data.payload) {
        const { payload } = data
        const { tournament, ...auction } = payload
        if (!lastUpdated) {
          init(tournament, auction)
        } else if (lastUpdated !== auction.updatedAt) {
          setUpdateUI(true)
          // Handle changes
          switch (auction.changeKey) {
            case 'INIT':
              init(tournament, auction)
              break
            case 'STATUS_CHANGE':
              setUi(prev => ({
                ...prev,
                auctionStatus: auction.status,
              }))
              break
            case 'GROUP_CHANGE':
            case 'PLAYER_CHANGE':
              setUi(prev => ({
                ...prev,
                auctionMeta: auction.auctionMeta,
              }))
              break
          }
          setState({ bid: Math.random(), lastUpdated: auction.updatedAt })
        } else {
          setUpdateUI(false)
        }
      }
    }
    return () => eventSource.close()
  }, [])
  useEffect(() => {
    if (updateUI) {
      if (!ui.loaded) setLoading(true)
      if (ui.loaded) setLoading(false)
      setK(getNextId())
    }
  }, [ui])
  if (!ui.loaded) return null
  if (!ui.auctionMeta) return null
  return (
    <div
      className={'w-full h-screen relative flex flex-col items-center'}
      key={k}
    >
      {ui.tournamentLogo !== '' && (
        <Image
          src={ui.tournamentLogo}
          alt={'Tournament Logo'}
          width={160}
          height={160}
          className={
            'absolute left-0 top-0 p-4 z-10 backdrop-blur-2xl bg-white mask-radial-to-white shadow-2xl rounded-xl m-6'
          }
        />
      )}
      {ui.auctionStatus === 'Not Started' || ui.auctionStatus === 'Paused' ? (
        <div
          className={
            'flex justify-center items-center flex-col text-center m-auto min-h-2/3 min-w-2/3 backdrop-blur-lg bg-white/50 gap-6'
          }
        >
          <TextGif
            gifUrl={'/images/giphy2.gif'}
            text={`Welcome to`}
            size={'xxl'}
          ></TextGif>
          <TextGif
            gifUrl={'/images/giphy.gif'}
            text={`${ui.tournamentName} auction`}
            size={'xll'}
          ></TextGif>
          <TextGif
            gifUrl={'/images/giphy2.gif'}
            text={`${ui.auctionStatus === 'Not Started' ? 'it will start soon' : 'will resume shortly'}`}
            size={'xxl'}
          ></TextGif>
        </div>
      ) : (
        <>
          <div
            className={
              'text-primary backdrop-blur-2xl p-4 shadow-2xl mx-auto m-6 w-fit rounded-xl'
            }
          >
            <h2 className={'text-4xl font-bold '}>{ui.tournamentName}</h2>
          </div>
          <div
            className={
              'm-auto min-h-2/3 min-w-2/3 backdrop-blur-lg flex flex-col items-center'
            }
          >
            <div className='flex justify-between items-center w-full pt-10 px-10'>
              <div className={'text-white font-extrabold  text-2xl'}>
                {ui.auctionMeta.currentGroup}
              </div>
              <div className={'text-white text-sm '}>
                {ui.auctionMeta.soldPlayers + 1} / {ui.auctionMeta.totalPlayers}
              </div>
            </div>
            <div className='mx-auto max-w-sm px-2 py-20 font-sans antialiased md:max-w-4xl md:px-4 lg:px-8'>
              <div className='relative grid grid-cols-1 gap-20 md:grid-cols-2'>
                <div>
                  <div className='relative h-80 w-full'>
                    <img
                      src={
                        ui.auctionMeta.currentPlayer.img_url !== ''
                          ? ui.auctionMeta.currentPlayer.img_url
                          : '/images/user.png'
                      }
                      alt={ui.auctionMeta.currentPlayer.name}
                      width={500}
                      height={500}
                      draggable={false}
                      className='h-full w-full rounded-3xl object-cover object-center'
                    />
                  </div>
                </div>
                <div className='flex flex-col py-4'>
                  <h3 className='text-4xl font-bold text-white '>
                    {ui.auctionMeta.currentPlayer.name}
                  </h3>

                  <p className='text-gray-200 text-3xl mt-6 font-semibold'>
                    {ui.auctionMeta.currentPlayer.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <Image
        src={'/images/media/auction-bg.png'}
        alt={'Auction'}
        fill
        objectFit={'cover'}
        className={'absolute -z-[1]'}
      />
    </div>
  )
}

export default AuctionPage
