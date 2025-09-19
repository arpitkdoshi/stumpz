import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { customAlphabet } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getNextId = () => {
  const nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890',
    10,
  )
  return `${nanoid()}`
}

export type DirtyFieldsType =
  | boolean
  | null
  | {
      [key: string]: DirtyFieldsType
    }
  | DirtyFieldsType[]

export function getDirtyValues<T extends Record<string, any>>(
  dirtyFields: Partial<Record<keyof T, DirtyFieldsType>>,
  values: T,
): Partial<T> {
  return Object.keys(dirtyFields).reduce((prev, key) => {
    const value = dirtyFields[key]
    if (!value) {
      return prev
    }
    const isObject = typeof value === 'object'
    const isArray = Array.isArray(value)
    const nestedValue =
      isObject && !isArray
        ? getDirtyValues(value as Record<string, any>, values[key])
        : values[key]
    return { ...prev, [key]: isArray ? values[key] : nestedValue }
  }, {} as Partial<T>)
}

type FacetCounts = { [value: string]: number }

export function getFacetObject<T>(array: T[], key: keyof T): FacetCounts {
  return array.reduce((acc: FacetCounts, item) => {
    const value = String(item[key])
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
}
