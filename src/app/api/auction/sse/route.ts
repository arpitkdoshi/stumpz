// app/api/auction/sse/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { auction, tournament } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { TSingleAuction, TSingleTournament } from '@/lib/types' // drizzle instance + schema import

export type Response = {
  payload: TSingleAuction & {
    tournament: TSingleTournament
  }
}

export async function GET(req: Request) {
  // Extract tournamentId from the URL query parameters
  const url = new URL(req.url)
  const tournamentId = url.searchParams.get('tournamentId')
  const auctionId = url.searchParams.get('auctionId')

  if (!tournamentId || !auctionId) {
    return NextResponse.json(
      { error: 'tournamentId and auctionId is required' },
      { status: 400 },
    )
  }
  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const t = await db.query.auction.findFirst({
          where: eq(auction.id, auctionId),
          with: {
            tournament: true,
          },
        })
        const toResp: Response = { payload: t! }

        controller.enqueue(`data: ${JSON.stringify(toResp)}\n\n`)
        await new Promise(res => setTimeout(res, 2000)) // 2s poll interval
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
