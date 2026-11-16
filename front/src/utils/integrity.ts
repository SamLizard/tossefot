/**
 * Vérification du texte (docs/UI_SPEC.md §7).
 * Port TypeScript de tools/check_tosafot.py : mêmes règles, mêmes messages.
 */
import { diffArrays } from 'diff'
import { t } from '@/i18n'
import type { StructureNode, TosafotDoc } from '@/types/tosafot'

export interface TextDiff {
  kind: 'missing' | 'extra'
  context: string
  words: string
  /** Segment le plus proche, pour défiler vers lui. */
  segmentId?: string
}

export interface IntegrityReport {
  ok: boolean
  wordCount: number
  segmentCount: number
  diffs: TextDiff[]
  /** Erreurs de structure et de références. */
  errors: string[]
}

export function normalize(text: string): string {
  return text
    .normalize('NFC')
    .replaceAll('"', '\u05F4')
    .replaceAll("'", '\u05F3')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokens(text: string): string[] {
  const normalized = normalize(text)
  return normalized ? normalized.split(' ') : []
}

export function flattenNodes(nodes: StructureNode[], out: StructureNode[] = []): StructureNode[] {
  for (const node of nodes) {
    out.push(node)
    flattenNodes(node.children ?? [], out)
  }
  return out
}

/**
 * Diff mot à mot. `owners[i]` = segment qui contient le mot `actual[i]`
 * (sert à localiser chaque différence).
 */
export function wordDiff(expected: string[], actual: string[], owners: string[] = []): TextDiff[] {
  const diffs: TextDiff[] = []
  let a = 0 // index dans expected
  let b = 0 // index dans actual
  for (const change of diffArrays(expected, actual)) {
    const count = change.value.length
    if (!change.added && !change.removed) {
      a += count
      b += count
      continue
    }
    const context = expected.slice(Math.max(0, a - 3), a).join(' ')
    const segmentId = owners[Math.min(b, owners.length - 1)]
    const words = change.value.join(' ')
    if (change.removed) {
      diffs.push({ kind: 'missing', context, words, segmentId })
      a += count
    } else {
      diffs.push({ kind: 'extra', context, words, segmentId })
      b += count
    }
  }
  return diffs
}

export function checkIntegrity(doc: TosafotDoc): IntegrityReport {
  const expected = tokens(doc.source.fullText)
  const actual: string[] = []
  const owners: string[] = []
  for (const segment of doc.segments) {
    for (const word of tokens(segment.he)) {
      actual.push(word)
      owners.push(segment.id)
    }
  }
  const diffs = wordDiff(expected, actual, owners)
  const errors = [...checkStructure(doc), ...checkReferences(doc)]
  return {
    ok: diffs.length === 0 && errors.length === 0,
    wordCount: expected.length,
    segmentCount: doc.segments.length,
    diffs,
    errors,
  }
}

function checkStructure(doc: TosafotDoc): string[] {
  const errors: string[] = []
  const order = flattenNodes(doc.structure).flatMap((n) => n.segmentIds)
  const segIds = doc.segments.map((s) => s.id)
  const seen = new Set<string>()
  const dup = new Set<string>()
  for (const id of order) (seen.has(id) ? dup : seen).add(id)
  if (dup.size) errors.push(t('integrity.errors.duplicateSegments', { ids: [...dup].sort().join(', ') }))
  const missing = segIds.filter((id) => !seen.has(id))
  if (missing.length) errors.push(t('integrity.errors.missingSegments', { ids: missing.join(', ') }))
  if (!dup.size && !missing.length && order.join() !== segIds.join()) {
    errors.push(t('integrity.errors.order'))
  }
  return errors
}

function checkReferences(doc: TosafotDoc): string[] {
  const errors: string[] = []
  const nodes = new Map(flattenNodes(doc.structure).map((n) => [n.id, n]))
  const sources = new Set(doc.sources.map((s) => s.id))
  const tables = new Set(doc.tables.map((t) => t.id))
  for (const s of doc.segments) {
    const node = nodes.get(s.nodeId)
    if (!node) errors.push(t('integrity.errors.unknownNode', { id: s.id, ref: s.nodeId }))
    else if (!node.segmentIds.includes(s.id)) errors.push(t('integrity.errors.nodeMismatch', { id: s.id, ref: s.nodeId }))
    for (const r of s.sourceIds) if (!sources.has(r)) errors.push(t('integrity.errors.unknownSource', { id: s.id, ref: r }))
    for (const r of s.tableIds ?? []) if (!tables.has(r)) errors.push(t('integrity.errors.unknownTable', { id: s.id, ref: r }))
  }
  for (const r of doc.context.tableIds) if (!tables.has(r)) errors.push(t('integrity.errors.unknownContextTable', { ref: r }))
  for (const e of doc.visualSummary.edges) {
    for (const id of [e.from, e.to]) if (!nodes.has(id)) errors.push(t('integrity.errors.unknownEdgeNode', { ref: id }))
  }
  return errors
}

/** Récupère le texte en direct sur Sefaria et le compare à fullText. */
export async function compareWithSefaria(doc: TosafotDoc, url: string): Promise<TextDiff[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(t('integrity.sefariaStatus', { status: response.status }))
  const json: unknown = await response.json()
  const raw = extractSefariaText(json)
  if (!raw) throw new Error(t('integrity.sefariaNoText'))
  return wordDiff(tokens(stripHtml(raw)), tokens(doc.source.fullText))
}

function extractSefariaText(json: unknown): string {
  const versions = (json as { versions?: { text?: unknown }[] }).versions
  const text = versions?.[0]?.text
  return flattenText(text)
}

function flattenText(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(flattenText).join(' ')
  return ''
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '')
}
