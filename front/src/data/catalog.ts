/**
 * Catalogue des תוספות disponibles : tous les fichiers JSON de /data.
 * Ajouter un תוספות = ajouter un fichier JSON avec le même schéma.
 * Les fichiers sont chargés à la demande (un chunk par fichier).
 */
import type { TosafotDoc } from '@/types/tosafot'

const loaders = import.meta.glob<TosafotDoc>('@data/*.json', { import: 'default' })

export interface CatalogEntry {
  /** Nom du fichier sans extension ; sert d'identifiant dans l'URL. */
  slug: string
  load: () => Promise<TosafotDoc>
}

export const catalog: CatalogEntry[] = Object.entries(loaders)
  .map(([path, load]) => ({ slug: path.split('/').pop()!.replace(/\.json$/, ''), load }))
  .sort((a, b) => a.slug.localeCompare(b.slug))

export function findEntry(slug: string): CatalogEntry | undefined {
  return catalog.find((entry) => entry.slug === slug)
}
