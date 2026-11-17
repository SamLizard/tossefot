/**
 * Versions locales d'un תוספות (JSON corrigé chargé par le relecteur).
 * Le contenu est dans IndexedDB (plusieurs Mo possibles) ; un petit index synchrone
 * est gardé en localStorage pour que le catalogue connaisse les entrées sans attendre.
 */
import { t } from '@/i18n'
import type { TosafotDoc } from '@/types/tosafot'

export interface LocalDocInfo {
  id: string
  title: string
  importedAt: string
}

const DB_NAME = 'tossefot-local'
const STORE = 'docs'
const INDEX_KEY = 'tossefot.localDocs.v1'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result as T)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export function listLocalDocs(): LocalDocInfo[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    const list = raw ? (JSON.parse(raw) as LocalDocInfo[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function writeIndex(list: LocalDocInfo[]): void {
  localStorage.setItem(INDEX_KEY, JSON.stringify(list))
}

/** Enregistre (ou remplace) la version locale de `doc.meta.id`. */
export async function saveLocalDoc(doc: TosafotDoc, now: Date = new Date()): Promise<LocalDocInfo> {
  await run('readwrite', (store) => store.put(doc, doc.meta.id))
  const info: LocalDocInfo = { id: doc.meta.id, title: doc.meta.title, importedAt: now.toISOString() }
  writeIndex([...listLocalDocs().filter((d) => d.id !== info.id), info])
  return info
}

export async function loadLocalDoc(id: string): Promise<TosafotDoc> {
  const doc = await run<TosafotDoc | undefined>('readonly', (store) => store.get(id))
  if (!doc) throw new Error(t('localDocs.notFound', { id }))
  return doc
}

export async function deleteLocalDoc(id: string): Promise<void> {
  await run('readwrite', (store) => store.delete(id))
  writeIndex(listLocalDocs().filter((d) => d.id !== id))
}

export const LOCAL_PREFIX = 'local-'

export function localSlug(id: string): string {
  return LOCAL_PREFIX + id
}
