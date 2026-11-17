/** Types de la relecture par un רב (docs/JSON_IDEAS.md §4). */
import type { ReviewLogEntry } from '@/types/tosafot'

export type CommentType = 'erreur' | 'preciser' | 'structure' | 'question' | 'valide'
export type CommentStatus = 'ouvert' | 'envoye' | 'corrige' | 'discute' | 'refuse'

/** Ce qui est commenté : un segment, un nœud ou une table, et éventuellement un champ. */
export interface CommentTarget {
  segmentId?: string
  nodeId?: string
  tableId?: string
  field?: string
}

/** Réponse de l'IA, lue dans `reviewLog` de la version suivante. */
export type AiResponse = Omit<ReviewLogEntry, 'commentId'>

export interface ReviewComment {
  id: string
  target: CommentTarget
  type: CommentType
  quote?: string
  text: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
  response?: AiResponse
  /** Le relecteur a accepté la réponse de l'IA. */
  validated?: boolean
}

/** Remarque telle qu'elle est exportée (format de JSON_IDEAS.md §4). */
export type ExportedComment = Pick<ReviewComment, 'id' | 'target' | 'type' | 'quote' | 'text' | 'status'>

export interface ReviewFile {
  tosafotId: string
  baseVersion: string
  reviewer: string
  comments: ExportedComment[]
}

export type CommentDraft = Pick<ReviewComment, 'target' | 'type' | 'quote' | 'text'>
