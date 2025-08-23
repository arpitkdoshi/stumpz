'use client'

import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuctionStore } from '@/hooks/auction/useAuctionStore'

const AuctionPage = () => {
  const { bid, setState } = useAuctionStore()
  const searchParams = useSearchParams()
  const tournamentId = searchParams.get('t')
  const auctionId = searchParams.get('a')

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/auction/sse?tournamentId=${tournamentId}&auctionId=${auctionId}`,
    )
    eventSource.onmessage = event => {
      const data = JSON.parse(event.data)
      console.log(data)
      setState({ bid: Math.random() })
    }
    return () => eventSource.close()
  }, [setState])
  return <div>{bid}</div>
}

export default AuctionPage
