'use server'

import { db } from '@/db'
import { team } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import logger from '@/lib/logger'
import { TResponse, TSingleTeam } from '@/lib/types'

export async function createTeam(
  data: Partial<TSingleTeam>,
): Promise<TResponse> {
  try {
    const requestPayload = JSON.stringify(data)

    // Basic validation
    if (!data.name || !data.tournamentId) {
      const errorMessage = 'Validation failed: name, tournamentId is required'
      logger.error({
        action: 'createTeam',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }

    const response = await db
      .insert(team)
      .values(data as TSingleTeam)
      .returning()

    logger.info({
      action: 'createTeam',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to create team' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'createTeam',
      requestPayload: JSON.stringify(data),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

// READ
export async function readTeam(id: string): Promise<TResponse> {
  try {
    // Basic validation
    if (!id || id === '') {
      const errorMessage = 'Validation failed: id is required'
      logger.error({
        action: 'readTeam',
        requestPayload: id,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    const response = await db.select().from(team).where(eq(team.id, id))
    if (response.length > 0) return { data: response[0], success: true }
    else {
      return { data: null, success: false, error: 'Unable to find team' }
    }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'readTeam',
      requestPayload: id,
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function readAllTournamentTeams(
  tournamentId: string,
): Promise<TResponse> {
  try {
    // Basic validation
    if (tournamentId === '') {
      const errorMessage = 'Validation failed: tournamentId is required'
      logger.error({
        action: 'readAllTeams',
        requestPayload: tournamentId,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    const response = await db
      .select()
      .from(team)
      .where(eq(team.tournamentId, tournamentId))
      .orderBy(desc(team.createdAt))
    return { data: response, success: true }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'readAllTeam',
      requestPayload: '',
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function updateTeam(data: Partial<TSingleTeam>) {
  try {
    const requestPayload = JSON.stringify(data)

    if (!data.id) {
      const errorMessage = 'Validation failed: Team ID is required'
      logger.error({
        action: 'updateTeam',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }

    // Simulate DB update (replace with actual DB call)
    const response = await db
      .update(team)
      .set(data)
      .where(eq(team.id, data.id))
      .returning({ id: team.id })

    logger.info({
      action: 'updateTeam',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to update team' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'updateTeam',
      requestPayload: JSON.stringify(data),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function deleteTeam(id: string) {
  try {
    const requestPayload = JSON.stringify({ id })

    if (!id) {
      const errorMessage = 'Team ID is required for deletion'
      logger.error({
        action: 'deleteTeam',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }

    const response = await db
      .delete(team)
      .where(eq(team.id, id))
      .returning({ id: team.id })

    logger.info({
      action: 'deleteTeam',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to delete team' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'deleteTeam',
      requestPayload: JSON.stringify({ id }),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}
