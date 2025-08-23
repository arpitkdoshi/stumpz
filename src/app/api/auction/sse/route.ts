// app/api/auction/sse/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { auction, TAuction } from '@/db/schema'
import { and, eq } from 'drizzle-orm' // drizzle instance + schema import

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
        const auc = await db
          .select()
          .from(auction)
          .where(
            and(
              eq(auction.tournamentId, tournamentId),
              eq(auction.id, auctionId),
            ),
          ) // drizzle query
        let data: TAuction | null = null
        if (auc.length > 0) {
          data = auc[0]
        }
        controller.enqueue(`data: ${data ? JSON.stringify(data) : null}\n\n`)
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
