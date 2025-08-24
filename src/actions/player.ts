'use server'

import { db } from '@/db'
import { player } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import logger from '@/lib/logger'
import { TResponse, TSinglePlayer } from '@/lib/types'

export async function createPlayer(
  data: Partial<TSinglePlayer>,
): Promise<TResponse> {
  try {
    const requestPayload = JSON.stringify(data)

    // Basic validation
    if (!data.name || !data.tournamentId) {
      const errorMessage = 'Validation failed: name, tournamentId is required'
      logger.error({
        action: 'createPlayer',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }

    const response = await db
      .insert(player)
      .values({
        name: data.name,
        tournamentId: data.tournamentId,
        teamId: data.teamId ?? null,
      })
      .returning({ id: player.id })

    logger.info({
      action: 'createPlayer',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to create player' }
  } catch (error: any) {
    logger.error({
      action: 'createPlayer',
      requestPayload: JSON.stringify(data),
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

// READ
export async function readPlayer(id: string): Promise<TResponse> {
  try {
    // Basic validation
    if (!id || id === '') {
      const errorMessage = 'Validation failed: id is required'
      logger.error({
        action: 'readPlayer',
        requestPayload: id,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    const response = await db.select().from(player).where(eq(player.id, id))
    if (response.length > 0) return { data: response[0], success: true }
    else {
      return { data: null, success: false, error: 'Unable to find player' }
    }
  } catch (error: any) {
    logger.error({
      action: 'readPlayer',
      requestPayload: id,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function readAllTeamPlayers(teamId: string): Promise<TResponse> {
  try {
    // Basic validation
    if (teamId === '') {
      const errorMessage = 'Validation failed: teamId is required'
      logger.error({
        action: 'readAllTeamPlayers',
        requestPayload: teamId,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    const response = await db
      .select()
      .from(player)
      .where(eq(player.teamId, teamId))
      .orderBy(desc(player.createdAt))
    return { data: response, success: true }
  } catch (error: any) {
    logger.error({
      action: 'readAllTeamPlayers',
      requestPayload: '',
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function readAllTournamentPlayers(
  tournamentId: string,
): Promise<TResponse> {
  try {
    // Basic validation
    if (tournamentId === '') {
      const errorMessage = 'Validation failed: tournamentId is required'
      logger.error({
        action: 'readAllTournamentPlayers',
        requestPayload: tournamentId,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    const response = await db
      .select()
      .from(player)
      .where(eq(player.tournamentId, tournamentId))
      .orderBy(desc(player.createdAt))
    return { data: response, success: true }
  } catch (error: any) {
    logger.error({
      action: 'readAllTournamentPlayers',
      requestPayload: '',
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function updatePlayer(data: Partial<TSinglePlayer>) {
  try {
    const requestPayload = JSON.stringify(data)

    if (!data.id) {
      const errorMessage = 'Validation failed: Player ID is required'
      logger.error({
        action: 'updatePlayer',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }

    if (!data.name) {
      const errorMessage = 'Validation failed: name is required'
      logger.error({
        action: 'updatePlayer',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }

    // Simulate DB update (replace with actual DB call)
    const response = await db
      .update(player)
      .set({
        name: data.name,
      })
      .where(eq(player.id, data.id))
      .returning({ id: player.id })

    logger.info({
      action: 'updatePlayer',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to update player' }
  } catch (error: any) {
    logger.error({
      action: 'updatePlayer',
      requestPayload: JSON.stringify(data),
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function deletePlayer(id: string) {
  try {
    const requestPayload = JSON.stringify({ id })

    if (!id) {
      const errorMessage = 'Player ID is required for deletion'
      logger.error({
        action: 'deletePlayer',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }

    const response = await db
      .delete(player)
      .where(eq(player.id, id))
      .returning({ id: player.id })

    logger.info({
      action: 'deletePlayer',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to delete player' }
  } catch (error: any) {
    logger.error({
      action: 'deletePlayer',
      requestPayload: JSON.stringify({ id }),
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}
