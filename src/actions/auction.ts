'use server'

import { TResponse, TSingleAuction } from '@/lib/types'
import logger from '@/lib/logger'
import { db } from '@/db'
import { auction } from '@/db/schema'
import { desc, eq, SQL } from 'drizzle-orm'
import { updateTournament } from '@/actions/tournament'

export async function createAuction(
  data: Partial<TSingleAuction>,
): Promise<TResponse> {
  try {
    const requestPayload = JSON.stringify(data)

    // Basic validation
    if (!data.tournamentId) {
      const errorMessage = 'Validation failed: Tournament Id is required'
      logger.error({
        action: 'createAuction',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }

    const response = await db
      .insert(auction)
      .values({ tournamentId: data.tournamentId })
      .returning()

    await updateTournament({
      id: data.tournamentId,
      currentAuctionId: response[0].id,
    })

    logger.info({
      action: 'createAuction',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0], success: true }
    }
    return { data: null, success: false, error: 'Unable to create auction' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'createAuction',
      requestPayload: JSON.stringify(data),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function readAuction(id: string): Promise<TResponse> {
  try {
    // Basic validation
    if (!id || id === '') {
      const errorMessage = 'Validation failed: id is required'
      logger.error({
        action: 'readAuction',
        requestPayload: id,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    const response = await db.select().from(auction).where(eq(auction.id, id))
    if (response.length > 0) return { data: response[0], success: true }
    else {
      return { data: null, success: false, error: 'Unable to find auction' }
    }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'readAuction',
      requestPayload: id,
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function readAuctionBySearchSpec(
  whereClause: SQL,
): Promise<TResponse> {
  try {
    // Basic validation
    if (!whereClause) {
      const errorMessage = 'Validation failed: where Clause is required'
      logger.error({
        action: 'readAuction',
        requestPayload: whereClause,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    const response = await db.select().from(auction).where(whereClause)
    if (response.length > 0) return { data: response[0], success: true }
    else {
      return { data: null, success: false, error: 'Unable to find auction' }
    }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'readAuction',
      requestPayload: whereClause,
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function readAllAuctions(): Promise<TResponse> {
  try {
    const response = await db
      .select()
      .from(auction)
      .orderBy(desc(auction.createdAt))
    return { data: response, success: true, error: '' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'readAuction',
      requestPayload: '',
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function updateAuction(data: Partial<TSingleAuction>) {
  try {
    const requestPayload = JSON.stringify(data)

    if (!data.id) {
      const errorMessage = 'Validation failed: Auction ID is required'
      logger.error({
        action: 'updateAuction',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    // Simulate DB update (replace with actual DB call)
    const response = await db
      .update(auction)
      .set({
        ...data,
      })
      .where(eq(auction.id, data.id))
      .returning({ id: auction.id })

    logger.info({
      action: 'updateAuction',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to update auction' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'updateAuction',
      requestPayload: JSON.stringify(data),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function deleteAuction(id: string) {
  try {
    const requestPayload = JSON.stringify({ id })

    if (!id) {
      const errorMessage = 'Auction ID is required for deletion'
      logger.error({
        action: 'deleteAuction',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    const response = await db
      .delete(auction)
      .where(eq(auction.id, id))
      .returning({ id: auction.id })

    logger.info({
      action: 'deleteAuction',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to delete auction' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'deleteAuction',
      requestPayload: JSON.stringify({ id }),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}
