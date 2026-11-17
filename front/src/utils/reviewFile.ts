/**
 * Fichier de retours de la relecture (docs/JSON_IDEAS.md §4) : construction, lecture,
 * fusion avec les remarques existantes, et application du `reviewLog` de l'IA.
 * Fonctions pures, sans état.
 */
import { t } from '@/i18n'
import type {
  AiResponse,
  CommentStatus,
  CommentType,
  ExportedComment,
  ReviewComment,
  ReviewFile,
} from '@/types/review'
import type { Meta, ReviewLogEntry } from '@/types/tosafot'
import { COMMENT_STATUSES, COMMENT_TYPES, targetKey } from '@/utils/reviewFields'

/** Version relue : `meta.version`, sinon la version du schéma et la date de l'export. */
export function baseVersion(meta: Meta, now: Date = new Date()): string {
  return meta.version ?? `${meta.schemaVersion} (${now.toISOString()})`
}

export function toExported(c: ReviewComment): ExportedComment {
  const out: ExportedComment = { id: c.id, target: { ...c.target }, type: c.type, text: c.text, status: c.status }
  if (c.quote) out.quote = c.quote
  return out
}

export function buildReviewFile(meta: Meta, reviewer: string, comments: ReviewComment[], now?: Date): ReviewFile {
  return {
    tosafotId: meta.id,
    baseVersion: baseVersion(meta, now),
    reviewer,
    comments: comments.map(toExported),
  }
}

/** Remarques encore à traiter par l'IA. */
export function isPending(c: Pick<ReviewComment, 'status'>): boolean {
  return c.status === 'ouvert' || c.status === 'envoye'
}

const TYPE_IDS = new Set<string>(COMMENT_TYPES.map((d) => d.id))
const STATUS_IDS = new Set<string>(COMMENT_STATUSES.map((d) => d.id))
const TARGET_KEYS = ['segmentId', 'nodeId', 'tableId', 'field'] as const

function parseComment(raw: unknown, index: number): ExportedComment {
  const c = raw as Record<string, unknown>
  const target = (c?.target ?? {}) as Record<string, unknown>
  if (!c || typeof c !== 'object' || typeof c.text !== 'string' || !TYPE_IDS.has(String(c.type))) {
    throw new Error(t('reviewing.importInvalidComment', { index: index + 1 }))
  }
  const out: ExportedComment = {
    id: typeof c.id === 'string' && c.id ? c.id : `import-${index + 1}`,
    target: {},
    type: c.type as CommentType,
    text: c.text,
    status: STATUS_IDS.has(String(c.status)) ? (c.status as CommentStatus) : 'ouvert',
  }
  for (const key of TARGET_KEYS) if (typeof target[key] === 'string') out.target[key] = target[key]
  if (typeof c.quote === 'string' && c.quote) out.quote = c.quote
  return out
}

/** Lit un fichier `.review.json` ; lève une erreur lisible s'il est invalide. */
export function parseReviewFile(text: string): ReviewFile {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(t('reviewing.importNotJson'))
  }
  const file = json as Record<string, unknown>
  if (!file || typeof file !== 'object' || !Array.isArray(file.comments)) {
    throw new Error(t('reviewing.importNoComments'))
  }
  return {
    tosafotId: String(file.tosafotId ?? ''),
    baseVersion: String(file.baseVersion ?? ''),
    reviewer: String(file.reviewer ?? ''),
    comments: file.comments.map(parseComment),
  }
}

function sameContent(a: ExportedComment, b: ExportedComment): boolean {
  return a.text === b.text && targetKey(a.target) === targetKey(b.target) && a.target.field === b.target.field
}

export function nextCommentId(comments: Pick<ReviewComment, 'id'>[]): string {
  const max = comments.reduce((m, c) => Math.max(m, Number(/^c(\d+)$/.exec(c.id)?.[1] ?? 0)), 0)
  return `c${max + 1}`
}

/**
 * Ajoute les remarques importées absentes. Une remarque identique (même cible, même texte)
 * est ignorée ; un id déjà pris par une autre remarque reçoit un nouvel id.
 */
export function mergeComments(
  existing: ReviewComment[],
  incoming: ExportedComment[],
  now: string,
): { comments: ReviewComment[]; added: number } {
  const comments = [...existing]
  let added = 0
  for (const inc of incoming) {
    if (comments.some((c) => sameContent(c, inc))) continue
    const id = comments.some((c) => c.id === inc.id) ? nextCommentId(comments) : inc.id
    comments.push({ ...inc, id, createdAt: now, updatedAt: now })
    added++
  }
  return { comments, added }
}

/** « corrigé » → « corrige » (accents et casse ignorés). */
export function mapLogStatus(status: string): CommentStatus | undefined {
  const s = status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  if (s === 'corrige' || s === 'discute' || s === 'refuse') return s
  return undefined
}

function sameResponse(a: AiResponse | undefined, b: AiResponse): boolean {
  return Boolean(a) && a!.status === b.status && a!.change === b.change && a!.answer === b.answer
}

/**
 * Applique les réponses de l'IA aux remarques à traiter (« ouvert » ou « envoye »).
 * Une remarque rouverte n'est pas refermée par la même réponse (si on recharge la même version).
 * Retourne le nombre de remarques mises à jour.
 */
export function applyReviewLog(comments: ReviewComment[], log: ReviewLogEntry[], now: string): number {
  let count = 0
  for (const entry of log) {
    const comment = comments.find((c) => c.id === entry.commentId)
    const status = mapLogStatus(String(entry.status ?? ''))
    if (!comment || !status || !isPending(comment)) continue
    const response: AiResponse = { status: entry.status }
    if (entry.change) response.change = entry.change
    if (entry.answer) response.answer = entry.answer
    if (Array.isArray(entry.targets)) response.targets = entry.targets
    if (sameResponse(comment.response, response)) continue
    comment.status = status
    comment.response = response
    comment.validated = false
    comment.updatedAt = now
    count++
  }
  return count
}
