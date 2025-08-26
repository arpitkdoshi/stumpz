'use server'

import { TResponse, TSingleTournament } from '@/lib/types'
import logger from '@/lib/logger'
import { db } from '@/db'
import { tournament } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import path from 'path'
import fsSync, { promises as fs } from 'fs'

type TDel = 'logo' | 'banner' | 'both'

async function delOldTournamentImage(id: string, toDel: TDel) {
  const r = await db
    .select({ img_url: tournament.logo_url, bImg: tournament.banner_url })
    .from(tournament)
    .where(eq(tournament.id, id))

  if (
    r &&
    r.length === 1 &&
    r[0].img_url &&
    r[0].img_url !== '' &&
    (toDel === 'logo' || toDel === 'both')
  ) {
    const oldArr = r[0].img_url.split('/')
    const oldPath = path.join(process.cwd(), 'public', ...oldArr)
    if (fsSync.existsSync(oldPath)) {
      await fs.rm(oldPath)
    }
  }
  if (
    r &&
    r.length === 1 &&
    r[0].bImg &&
    r[0].bImg !== '' &&
    (toDel === 'banner' || toDel === 'both')
  ) {
    const oldArr = r[0].bImg.split('/')
    const oldPath = path.join(process.cwd(), 'public', ...oldArr)
    if (fsSync.existsSync(oldPath)) {
      await fs.rm(oldPath)
    }
  }
}

export async function createTournament(
  data: Partial<TSingleTournament>,
): Promise<TResponse> {
  try {
    const requestPayload = JSON.stringify(data)

    // Basic validation
    if (!data.name) {
      const errorMessage = 'Validation failed: name is required'
      logger.error({
        action: 'createTournament',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }

    const response = await db
      .insert(tournament)
      .values({ name: data.name })
      .returning({ id: tournament.id })

    logger.info({
      action: 'createTournament',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to create tournament' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'createTournament',
      requestPayload: JSON.stringify(data),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function readTournament(id: string): Promise<TResponse> {
  try {
    // Basic validation
    if (!id || id === '') {
      const errorMessage = 'Validation failed: id is required'
      logger.error({
        action: 'readTournament',
        requestPayload: id,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    const response = await db
      .select()
      .from(tournament)
      .where(eq(tournament.id, id))
    if (response.length > 0) return { data: response[0], success: true }
    else {
      return { data: null, success: false, error: 'Unable to find tournament' }
    }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'readTournament',
      requestPayload: id,
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function readAllTournaments(): Promise<TResponse> {
  try {
    const response = await db
      .select()
      .from(tournament)
      .orderBy(desc(tournament.createdAt))
    return { data: response, success: true, error: '' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'readTournament',
      requestPayload: '',
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function updateTournament(data: Partial<TSingleTournament>) {
  try {
    const requestPayload = JSON.stringify(data)

    if (!data.id) {
      const errorMessage = 'Validation failed: Tournament ID is required'
      logger.error({
        action: 'updateTournament',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    let toDel: TDel | '' = ''
    if (data.logo_url && data.logo_url !== '') {
      toDel = 'logo'
    }
    if (data.banner_url && data.banner_url !== '') {
      if (toDel === 'logo') {
        toDel = 'both'
      } else {
        toDel = 'banner'
      }
    }
    if (toDel !== '') {
      await delOldTournamentImage(data.id, toDel)
    }
    // Simulate DB update (replace with actual DB call)
    const response = await db
      .update(tournament)
      .set({
        ...data,
      })
      .where(eq(tournament.id, data.id))
      .returning({ id: tournament.id })

    logger.info({
      action: 'updateTournament',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to update tournament' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'updateTournament',
      requestPayload: JSON.stringify(data),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}

export async function deleteTournament(id: string) {
  try {
    const requestPayload = JSON.stringify({ id })

    if (!id) {
      const errorMessage = 'Tournament ID is required for deletion'
      logger.error({
        action: 'deleteTournament',
        requestPayload,
        errorMessage,
        timestamp: new Date().toISOString(),
      })
      return { data: null, success: false, error: errorMessage }
    }
    await delOldTournamentImage(id, 'both')
    const response = await db
      .delete(tournament)
      .where(eq(tournament.id, id))
      .returning({ id: tournament.id })

    logger.info({
      action: 'deleteTournament',
      requestPayload,
      responsePayload: JSON.stringify(response),
      timestamp: new Date().toISOString(),
    })

    if (response.length > 0) {
      return { data: response[0].id, success: true }
    }
    return { data: null, success: false, error: 'Unable to delete tournament' }
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    logger.error({
      action: 'deleteTournament',
      requestPayload: JSON.stringify({ id }),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
    })
    return { data: null, success: false, error: error.message }
  }
}
