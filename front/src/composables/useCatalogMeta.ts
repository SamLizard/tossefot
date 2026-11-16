/**
 * Métadonnées des entrées du catalogue, chargées à la demande
 * (le titre n'est connu qu'après le chargement du JSON).
 */
import { reactive } from 'vue'
import type { CatalogEntry } from '@/data/catalog'
import type { Meta } from '@/types/tosafot'

export type MetaState = { status: 'loading' } | { status: 'ready'; meta: Meta } | { status: 'error' }

/** Cache partagé : on ne recharge pas un fichier déjà lu. */
const states = reactive<Record<string, MetaState>>({})

export function useCatalogMeta() {
  function load(entry: CatalogEntry): void {
    if (states[entry.slug]) return
    states[entry.slug] = { status: 'loading' }
    entry
      .load()
      .then((doc) => (states[entry.slug] = { status: 'ready', meta: doc.meta }))
      .catch(() => (states[entry.slug] = { status: 'error' }))
  }

  function state(slug: string): MetaState {
    return states[slug] ?? { status: 'loading' }
  }

  return { load, state }
}
