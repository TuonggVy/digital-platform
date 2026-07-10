import { readStorage, writeStorage } from '@/utils/storage'
import { SEED_VERSION } from '@/constants/config'

/**
 * Thin localStorage-backed repository seeded from mock data on first run.
 * Lets admin CRUD mutate "server" state without a real backend, while keeping
 * page code decoupled from localStorage — swap this file for a real API client later.
 *
 * Re-seeds automatically whenever SEED_VERSION changes, so updating mock data in code
 * (e.g. adding/editing products) shows up for users who already have older cached data,
 * without requiring them to manually clear localStorage.
 */
export function createRepository<T>(storageKey: string, seedData: T[]) {
  const versionKey = `${storageKey}__seedVersion`

  function getAll(): T[] {
    const existing = localStorage.getItem(storageKey)
    const seededVersion = localStorage.getItem(versionKey)
    if (existing === null || seededVersion !== SEED_VERSION) {
      writeStorage(storageKey, seedData)
      writeStorage(versionKey, SEED_VERSION)
      return seedData
    }
    return readStorage<T[]>(storageKey, seedData)
  }

  function saveAll(items: T[]): void {
    writeStorage(storageKey, items)
    writeStorage(versionKey, SEED_VERSION)
  }

  return { getAll, saveAll }
}
