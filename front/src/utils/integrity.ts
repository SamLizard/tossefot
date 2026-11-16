/**
 * Vérification du texte (docs/UI_SPEC.md §7).
 * Port TypeScript de tools/check_tosafot.py : mêmes règles, mêmes messages.
 */
import { diffArrays } from 'diff'
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
  if (dup.size) errors.push(`Segments rattachés à plusieurs nœuds : ${[...dup].sort().join(', ')}`)
  const missing = segIds.filter((id) => !seen.has(id))
  if (missing.length) errors.push(`Segments absents de la structure : ${missing.join(', ')}`)
  if (!dup.size && !missing.length && order.join() !== segIds.join()) {
    errors.push('La structure ne suit pas l’ordre du texte.')
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
    if (!node) errors.push(`${s.id} : nodeId inconnu ${s.nodeId}`)
    else if (!node.segmentIds.includes(s.id)) errors.push(`${s.id} : nodeId ${s.nodeId} ne le contient pas`)
    for (const r of s.sourceIds) if (!sources.has(r)) errors.push(`${s.id} : source inconnue ${r}`)
    for (const r of s.tableIds ?? []) if (!tables.has(r)) errors.push(`${s.id} : table inconnue ${r}`)
  }
  for (const r of doc.context.tableIds) if (!tables.has(r)) errors.push(`context : table inconnue ${r}`)
  for (const e of doc.visualSummary.edges) {
    for (const id of [e.from, e.to]) if (!nodes.has(id)) errors.push(`edge : nœud inconnu ${id}`)
  }
  return errors
}

/** Récupère le texte en direct sur Sefaria et le compare à fullText. */
export async function compareWithSefaria(doc: TosafotDoc, url: string): Promise<TextDiff[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Sefaria a répondu ${response.status}`)
  const json: unknown = await response.json()
  const raw = extractSefariaText(json)
  if (!raw) throw new Error('Réponse Sefaria sans texte')
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
