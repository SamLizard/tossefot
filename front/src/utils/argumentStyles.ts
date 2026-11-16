/** Couleurs et traits de la carte d'arguments (docs/UI_SPEC.md §3.3). */
import type { MapEdgeType } from '@/utils/argumentLayout'
import { lighten } from '@/utils/color'

export interface EdgeStyle {
  /** Clé i18n du libellé. */
  labelKey: string
  color: string
  width: number
  /** Attribut SVG `stroke-dasharray` ; absent = trait plein. */
  dash?: string
  /** Croix au milieu de la flèche (« barré »). */
  cross?: boolean
  /** Pas de pointe de flèche (lien de hiérarchie). */
  noArrow?: boolean
}

export const EDGE_STYLES: Record<MapEdgeType, EdgeStyle> = {
  prouve: { labelKey: 'map.edges.prouve', color: '#16a34a', width: 2 },
  rejette: { labelKey: 'map.edges.rejette', color: '#ea580c', width: 2, cross: true },
  objecte: { labelKey: 'map.edges.objecte', color: '#dc2626', width: 2, dash: '7 5' },
  répond: { labelKey: 'map.edges.repond', color: '#0d9488', width: 2 },
  fonde: { labelKey: 'map.edges.fonde', color: '#6b7280', width: 1.75, dash: '2 4' },
  hierarchie: { labelKey: 'map.edges.hierarchie', color: '#94a3b8', width: 1.25, dash: '1 3', noArrow: true },
}

/** Types affichés dans la légende, dans cet ordre. */
export const EDGE_LEGEND: MapEdgeType[] = ['prouve', 'rejette', 'objecte', 'répond', 'fonde', 'hierarchie']

export interface AttributionStyle {
  /** Bordure du nœud. */
  color: string
  /** Fond teinté (transparent pour rester lisible en thème sombre). */
  tint: string
}

export const ATTRIBUTION_STYLES: Record<string, AttributionStyle> = {
  tosafot: { color: '#3b6ea5', tint: 'rgba(59, 110, 165, 0.08)' },
  'rach-bahag': { color: '#b45309', tint: 'rgba(180, 83, 9, 0.10)' },
  ri: { color: '#7c3aed', tint: 'rgba(124, 58, 237, 0.09)' },
}

const FALLBACK_ATTRIBUTION: AttributionStyle = { color: '#94a3b8', tint: 'transparent' }

export function attributionStyle(id: string | undefined, dark = false): AttributionStyle {
  const style = (id && ATTRIBUTION_STYLES[id]) || FALLBACK_ATTRIBUTION
  return dark ? { ...style, color: lighten(style.color, 0.4) } : style
}

/** Id de `<marker>` SVG pour un type de flèche (sans caractère accentué). */
export function markerId(type: MapEdgeType): string {
  return `map-arrow-${type === 'répond' ? 'repond' : type}`
}
