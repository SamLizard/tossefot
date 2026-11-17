/**
 * Catalogue des תוספות disponibles : tous les fichiers JSON de /data,
 * plus les versions locales chargées par un relecteur (IndexedDB, voir utils/localDocs.ts).
 * Ajouter un תוספות = ajouter un fichier JSON avec le même schéma.
 * Les fichiers sont chargés à la demande (un chunk par fichier).
 */
import { reactive } from 'vue'
import type { TosafotDoc } from '@/types/tosafot'
import { listLocalDocs, loadLocalDoc, localSlug, type LocalDocInfo } from '@/utils/localDocs'

const loaders = import.meta.glob<TosafotDoc>('@data/*.json', { import: 'default' })

export interface CatalogEntry {
  /** Nom du fichier sans extension (ou « local-<meta.id> ») ; sert d'identifiant dans l'URL. */
  slug: string
  load: () => Promise<TosafotDoc>
  /** Présent pour une version locale (rien n'est écrit sur le disque). */
  local?: LocalDocInfo
}

/** Fichiers de /data uniquement. */
export const fileCatalog: CatalogEntry[] = Object.entries(loaders)
  .map(([path, load]) => ({ slug: path.split('/').pop()!.replace(/\.json$/, ''), load }))
  .sort((a, b) => a.slug.localeCompare(b.slug))

function localEntries(): CatalogEntry[] {
  return listLocalDocs().map((info) => ({
    slug: localSlug(info.id),
    load: () => loadLocalDoc(info.id),
    local: info,
  }))
}

/** Fichiers puis versions locales ; réactif (mis à jour par `refreshLocalCatalog`). */
export const catalog = reactive<CatalogEntry[]>([...fileCatalog, ...localEntries()])

export function refreshLocalCatalog(): void {
  catalog.splice(0, catalog.length, ...fileCatalog, ...localEntries())
}

export function findEntry(slug: string): CatalogEntry | undefined {
  return catalog.find((entry) => entry.slug === slug)
}
