/**
 * Différences entre la version relue et la version corrigée.
 * À l'export, on garde un instantané des champs textuels (segments et nœuds) ;
 * au chargement de la nouvelle version, on compare champ par champ.
 */
import { diffWords } from 'diff'
import type { TosafotDoc } from '@/types/tosafot'
import { LEVELS } from '@/types/tosafot'
import { flattenNodes } from '@/utils/integrity'

/** Champs comparés d'un élément : id du champ (mêmes ids que TARGET_FIELDS) → texte. */
export type FieldTexts = Record<string, string>

export interface DocSnapshot {
  version: string
  takenAt: string
  segments: Record<string, FieldTexts>
  nodes: Record<string, FieldTexts>
}

export interface FieldChange {
  field: string
  before: string
  after: string
}

export interface ItemChange {
  kind: 'segment' | 'node'
  id: string
  /** 'added' / 'removed' : l'élément n'existe que dans une des deux versions. */
  state: 'changed' | 'added' | 'removed'
  fields: FieldChange[]
}

export interface DiffPart {
  value: string
  added: boolean
  removed: boolean
}

function clean(fields: Record<string, string | undefined>): FieldTexts {
  const out: FieldTexts = {}
  for (const [key, value] of Object.entries(fields)) if (value) out[key] = value
  return out
}

export function takeSnapshot(doc: TosafotDoc, version: string, now: Date = new Date()): DocSnapshot {
  const segments: Record<string, FieldTexts> = {}
  for (const s of doc.segments) {
    segments[s.id] = clean({
      he: s.he,
      translation: s.translation,
      ...Object.fromEntries(LEVELS.map((l) => [`explanation.${l}`, s.explanation?.[l]])),
    })
  }
  const nodes: Record<string, FieldTexts> = {}
  for (const n of flattenNodes(doc.structure)) {
    nodes[n.id] = clean({
      title: n.title,
      ...Object.fromEntries(LEVELS.map((l) => [`summary.${l}`, n.summary?.[l]])),
      conclusion: n.conclusion,
      structure: n.segmentIds.join(', '),
    })
  }
  return { version, takenAt: now.toISOString(), segments, nodes }
}

function compareItems(kind: ItemChange['kind'], before: Record<string, FieldTexts>, after: Record<string, FieldTexts>): ItemChange[] {
  const changes: ItemChange[] = []
  const ids = [...Object.keys(after), ...Object.keys(before).filter((id) => !(id in after))]
  for (const id of ids) {
    const a = before[id]
    const b = after[id]
    const keys = [...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])]
    const fields = keys
      .map((field) => ({ field, before: a?.[field] ?? '', after: b?.[field] ?? '' }))
      .filter((f) => f.before !== f.after)
    if (!fields.length) continue
    changes.push({ kind, id, state: !a ? 'added' : !b ? 'removed' : 'changed', fields })
  }
  return changes
}

/** Changements entre l'instantané et la nouvelle version, dans l'ordre de la nouvelle version. */
export function compareSnapshots(before: DocSnapshot, after: DocSnapshot): ItemChange[] {
  return [...compareItems('node', before.nodes, after.nodes), ...compareItems('segment', before.segments, after.segments)]
}

/**
 * Diff mot à mot. Le découpage par défaut de `diffWords` coupe l'hébreu lettre par lettre :
 * on lui donne un découpeur Intl par mots (qui garde ״ et ׳ dans le mot).
 */
export function wordParts(before: string, after: string): DiffPart[] {
  const intlSegmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('he', { granularity: 'word' }) : undefined
  return diffWords(before, after, intlSegmenter ? { intlSegmenter } : {}).map((c) => ({
    value: c.value,
    added: Boolean(c.added),
    removed: Boolean(c.removed),
  }))
}
