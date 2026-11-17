/** Validation minimale d'un JSON de תוספות chargé par l'utilisateur (avant checkIntegrity). */
import { t } from '@/i18n'
import type { TosafotDoc } from '@/types/tosafot'

export type ParseResult = { ok: true; doc: TosafotDoc } | { ok: false; errors: string[] }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export function parseTosafotJson(text: string): ParseResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch (e) {
    return { ok: false, errors: [t('loadDoc.errors.notJson', { message: e instanceof Error ? e.message : String(e) })] }
  }
  if (!isObject(json)) return { ok: false, errors: [t('loadDoc.errors.notObject')] }

  const errors: string[] = []
  const meta = json.meta
  if (!isObject(meta) || typeof meta.id !== 'string' || !meta.id) errors.push(t('loadDoc.errors.metaId'))
  if (!Array.isArray(json.segments) || !json.segments.length) errors.push(t('loadDoc.errors.segments'))
  if (!Array.isArray(json.structure) || !json.structure.length) errors.push(t('loadDoc.errors.structure'))
  if (!isObject(json.source) || typeof json.source.fullText !== 'string') errors.push(t('loadDoc.errors.fullText'))
  if (errors.length) return { ok: false, errors }

  // Champs utilisés partout par checkIntegrity et les vues : on complète plutôt que de planter.
  const doc = json as unknown as TosafotDoc
  doc.tables ??= []
  doc.sources ??= []
  doc.context ??= { title: '', levels: {}, gemara: [], tableIds: [] }
  doc.context.tableIds ??= []
  doc.visualSummary ??= { recommended: '', why: '', edges: [] }
  doc.visualSummary.edges ??= []
  for (const s of doc.segments) {
    s.sourceIds ??= []
    s.terms ??= []
    s.explanation ??= {}
  }
  return { ok: true, doc }
}
