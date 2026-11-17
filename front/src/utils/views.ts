/** Vues de la page d'un תוספות : onglets principaux + pages du menu. */
import type { ViewId } from '@/composables/usePreferences'

/** Vues accessibles par la route `/:slug/:view?`. */
export type PageView = ViewId | 'glossary' | 'notes' | 'review'

export interface ViewTab {
  id: ViewId
  /** Clé i18n du libellé (fichiers de `src/i18n/locales`). */
  labelKey: string
  icon: string
}

export const VIEW_TABS: readonly ViewTab[] = [
  { id: 'context', labelKey: 'views.context', icon: 'mdi-compass-outline' },
  { id: 'structure', labelKey: 'views.structure', icon: 'mdi-file-tree-outline' },
  { id: 'text', labelKey: 'views.text', icon: 'mdi-text-long' },
  { id: 'map', labelKey: 'views.map', icon: 'mdi-graph-outline' },
  { id: 'synthesis', labelKey: 'views.synthesis', icon: 'mdi-check-decagram-outline' },
]

const MAIN_VIEWS = new Set<string>(VIEW_TABS.map((t) => t.id))
const PAGE_VIEWS = new Set<string>([...MAIN_VIEWS, 'glossary', 'notes', 'review'])

export function isMainView(view: string): view is ViewId {
  return MAIN_VIEWS.has(view)
}

export function isPageView(view: string): view is PageView {
  return PAGE_VIEWS.has(view)
}

/** Noms utilisés dans `visualSummary.recommended` → onglet. */
const RECOMMENDED_ALIASES: Record<string, ViewId> = {
  'argument-map': 'map',
  'continuous-text': 'text',
}

export function recommendedView(recommended: string | undefined): ViewId | undefined {
  if (!recommended) return undefined
  const view = RECOMMENDED_ALIASES[recommended] ?? recommended
  return isMainView(view) ? view : undefined
}
