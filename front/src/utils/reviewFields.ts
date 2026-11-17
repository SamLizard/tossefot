/** Tables de la relecture : types de remarque, statuts, champs commentables, ordre du texte. */
import type { CommentStatus, CommentTarget, CommentType } from '@/types/review'
import type { StructureNode, TosafotDoc } from '@/types/tosafot'

export interface CommentTypeDef {
  id: CommentType
  labelKey: string
  icon: string
  color: string
}

export const COMMENT_TYPES: readonly CommentTypeDef[] = [
  { id: 'erreur', labelKey: 'reviewing.types.erreur', icon: 'mdi-alert-circle-outline', color: 'error' },
  { id: 'preciser', labelKey: 'reviewing.types.preciser', icon: 'mdi-magnify-plus-outline', color: 'warning' },
  { id: 'structure', labelKey: 'reviewing.types.structure', icon: 'mdi-file-tree-outline', color: 'primary' },
  { id: 'question', labelKey: 'reviewing.types.question', icon: 'mdi-help-circle-outline', color: 'info' },
  { id: 'valide', labelKey: 'reviewing.types.valide', icon: 'mdi-check-circle-outline', color: 'success' },
]

export interface CommentStatusDef {
  id: CommentStatus
  labelKey: string
  color: string
}

export const COMMENT_STATUSES: readonly CommentStatusDef[] = [
  { id: 'ouvert', labelKey: 'reviewing.statuses.ouvert', color: 'warning' },
  { id: 'envoye', labelKey: 'reviewing.statuses.envoye', color: 'info' },
  { id: 'corrige', labelKey: 'reviewing.statuses.corrige', color: 'success' },
  { id: 'discute', labelKey: 'reviewing.statuses.discute', color: 'secondary' },
  { id: 'refuse', labelKey: 'reviewing.statuses.refuse', color: 'error' },
]

export function typeDef(id: CommentType): CommentTypeDef {
  return COMMENT_TYPES.find((d) => d.id === id) ?? COMMENT_TYPES[0]!
}

export function statusDef(id: CommentStatus): CommentStatusDef {
  return COMMENT_STATUSES.find((d) => d.id === id) ?? COMMENT_STATUSES[0]!
}

export type TargetKind = 'segment' | 'node' | 'table'

export interface FieldDef {
  id: string
  labelKey: string
}

/** Champs proposés dans le dialogue ; les mêmes ids servent au diff entre versions. */
export const TARGET_FIELDS: Record<TargetKind, readonly FieldDef[]> = {
  segment: [
    { id: 'he', labelKey: 'reviewing.fields.he' },
    { id: 'translation', labelKey: 'reviewing.fields.translation' },
    { id: 'explanation.essentiel', labelKey: 'reviewing.fields.explanationEssentiel' },
    { id: 'explanation.standard', labelKey: 'reviewing.fields.explanationStandard' },
    { id: 'explanation.approfondi', labelKey: 'reviewing.fields.explanationApprofondi' },
    { id: 'terms', labelKey: 'reviewing.fields.terms' },
    { id: 'notes', labelKey: 'reviewing.fields.notes' },
    { id: 'sources', labelKey: 'reviewing.fields.sources' },
  ],
  node: [
    { id: 'title', labelKey: 'reviewing.fields.title' },
    { id: 'summary', labelKey: 'reviewing.fields.summary' },
    { id: 'summary.essentiel', labelKey: 'reviewing.fields.summaryEssentiel' },
    { id: 'summary.standard', labelKey: 'reviewing.fields.summaryStandard' },
    { id: 'summary.approfondi', labelKey: 'reviewing.fields.summaryApprofondi' },
    { id: 'conclusion', labelKey: 'reviewing.fields.conclusion' },
    { id: 'structure', labelKey: 'reviewing.fields.structure' },
  ],
  table: [
    { id: 'title', labelKey: 'reviewing.fields.title' },
    { id: 'rows', labelKey: 'reviewing.fields.rows' },
    { id: 'note', labelKey: 'reviewing.fields.note' },
  ],
}

export function targetKind(target: CommentTarget): TargetKind | undefined {
  if (target.segmentId) return 'segment'
  if (target.nodeId) return 'node'
  if (target.tableId) return 'table'
  return undefined
}

/** Clé de l'élément visé (sans le champ) : « segment:s37 », « node:IV »… */
export function targetKey(target: CommentTarget): string {
  const kind = targetKind(target)
  if (kind === 'segment') return `segment:${target.segmentId}`
  if (kind === 'node') return `node:${target.nodeId}`
  if (kind === 'table') return `table:${target.tableId}`
  return 'general'
}

export function fieldLabelKey(kind: TargetKind | undefined, field: string | undefined): string | undefined {
  if (!kind || !field) return undefined
  return TARGET_FIELDS[kind].find((f) => f.id === field)?.labelKey
}

/**
 * Rang de chaque élément dans l'ordre de lecture : un nœud, puis ses segments,
 * puis ses enfants (comme dans la vue Structure). Les tables viennent après.
 */
export function buildTargetOrder(doc: TosafotDoc): Map<string, number> {
  const order = new Map<string, number>()
  const add = (key: string) => {
    if (!order.has(key)) order.set(key, order.size)
  }
  const visit = (node: StructureNode) => {
    add(`node:${node.id}`)
    for (const id of node.segmentIds) add(`segment:${id}`)
    for (const child of node.children ?? []) visit(child)
  }
  doc.structure.forEach(visit)
  for (const s of doc.segments) add(`segment:${s.id}`)
  for (const table of doc.tables) add(`table:${table.id}`)
  return order
}
