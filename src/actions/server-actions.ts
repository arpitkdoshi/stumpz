'use server'
import path, { join } from 'path'
import fsSync, { promises as fs } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { getNextId } from '@/lib/utils'

export async function getImageBase64(imagePathInPublic: string) {
  const publicDirPath = path.join(process.cwd(), 'public', 'uploads')
  const fullImagePath = path.join(publicDirPath, imagePathInPublic)

  try {
    const imageBuffer = await fs.readFile(fullImagePath)
    // Determine image type (e.g., 'jpeg', 'png') based on file extension
    return `data:image/${path.extname(imagePathInPublic).substring(1)};base64,${imageBuffer.toString('base64')}`
  } catch (error) {
    console.error(`Error reading image: ${error}`)
    return null // Handle error gracefully
  }
}

export async function saveImageBase64(image: string, fileName: string) {
  // Remove the data URL prefix (e.g., "data:image/png;base64,")
  let ret = false
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  // Define the path where you want to save the image
  // Ensure the 'public/uploads' directory exists or adjust the path
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const filePath = path.join(uploadDir, fileName)

  try {
    // Create the directory if it doesn't exist
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true })
    }
    fsSync.writeFileSync(filePath, buffer)
    ret = true
  } catch (error: any) {
    console.log(error.message)
    console.log(error.stack)
    ret = false
  }
  return ret
}

export async function uploadCroppedImage(file: File): Promise<string | null> {
  if (!file) return null
  const arrayBuffer = await file.arrayBuffer()
  // Ensure uploads folder exists
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  const filename = `${uuidv4()}.png`
  const filepath = join(uploadDir, filename)

  await writeFile(filepath, Buffer.from(arrayBuffer))
  // Returns the public URL
  return `/uploads/${filename}`
}

export async function createImageFile(dataURI: string, oldUrl: string) {
  try {
    if (oldUrl !== '') {
      const oldArr = oldUrl.split('/')
      const oldPath = path.join(process.cwd(), 'public', ...oldArr)
      if (fsSync.existsSync(oldPath)) {
        await fs.rm(oldPath)
      }
    }
    const base64String = dataURI.split(',')[1]
    const buffer = Buffer.from(base64String, 'base64')
    const fileName = `${getNextId()}.png`
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)
    await fs.writeFile(filePath, buffer)
    return `/uploads/${fileName}`
  } catch (error) {
    console.error('Error creating image file:', error)
    throw error
  }
}
