/**
 * Prompt prêt à copier pour l'IA qui produit le JSON (docs/JSON_IDEAS.md §4).
 * Fonction pure : consignes + remarques (lisibles et en JSON). Le JSON du תוספות
 * n'est pas inclus (trop gros pour le presse-papiers) : le relecteur le joint à part.
 */
import { t } from '@/i18n'
import type { ExportedComment, ReviewFile } from '@/types/review'
import { fieldLabelKey, statusDef, targetKind, typeDef } from '@/utils/reviewFields'

export interface PromptContext {
  /** Nom du fichier JSON à joindre (ex. « bk56b.json »). */
  jsonFileName: string
  /** Titre du תוספות (meta.title). */
  title: string
}

function describeTarget(c: ExportedComment): string {
  const { segmentId, nodeId, tableId, field } = c.target
  const kind = targetKind(c.target)
  const where = segmentId
    ? t('reviewPrompt.targetSegment', { id: segmentId })
    : nodeId
      ? t('reviewPrompt.targetNode', { id: nodeId })
      : tableId
        ? t('reviewPrompt.targetTable', { id: tableId })
        : t('reviewPrompt.targetGeneral')
  if (!field) return where
  const labelKey = fieldLabelKey(kind, field)
  const label = labelKey ? t(labelKey) : field
  return t('reviewPrompt.targetWithField', { where, label, field })
}

function describeComment(c: ExportedComment, index: number): string {
  const lines = [
    t('reviewPrompt.commentHead', {
      n: index + 1,
      id: c.id,
      type: t(typeDef(c.type).labelKey),
      target: describeTarget(c),
    }),
  ]
  if (c.quote) lines.push(t('reviewPrompt.commentQuote', { quote: c.quote }))
  lines.push(t('reviewPrompt.commentText', { text: c.text }))
  if (c.status !== 'ouvert' && c.status !== 'envoye') {
    lines.push(t('reviewPrompt.commentStatus', { status: t(statusDef(c.status).labelKey) }))
  }
  return lines.join('\n')
}

/** Consignes numérotées (une clé i18n par consigne, dans l'ordre). */
const RULE_KEYS = [
  'reviewPrompt.rules.onlyComments',
  'reviewPrompt.rules.daf',
  'reviewPrompt.rules.stableIds',
  'reviewPrompt.rules.fullText',
  'reviewPrompt.rules.concatenation',
  'reviewPrompt.rules.hebrew',
  'reviewPrompt.rules.disagree',
  'reviewPrompt.rules.questions',
  'reviewPrompt.rules.validated',
  'reviewPrompt.rules.reviewLog',
  'reviewPrompt.rules.version',
  'reviewPrompt.rules.output',
] as const

export function buildReviewPrompt(file: ReviewFile, context: PromptContext): string {
  const rules = RULE_KEYS.map((key, i) => `${i + 1}. ${t(key, { version: file.baseVersion })}`)
  const reviewLogExample = JSON.stringify(
    [
      { commentId: 'c1', status: 'corrigé', change: '…', targets: ['s37'] },
      { commentId: 'c2', status: 'discuté', answer: '…', targets: ['IV'] },
      { commentId: 'c3', status: 'refusé', answer: '…', targets: ['s12'] },
    ],
    null,
    2,
  )
  return [
    t('reviewPrompt.role', { title: context.title }),
    t('reviewPrompt.inputs', { file: context.jsonFileName, count: file.comments.length, reviewer: file.reviewer || '—' }),
    `## ${t('reviewPrompt.rulesTitle')}`,
    rules.join('\n'),
    t('reviewPrompt.reviewLogFormat'),
    '```json\n' + reviewLogExample + '\n```',
    `## ${t('reviewPrompt.commentsTitle', { count: file.comments.length })}`,
    file.comments.map(describeComment).join('\n\n'),
    `## ${t('reviewPrompt.jsonTitle')}`,
    '```json\n' + JSON.stringify(file, null, 2) + '\n```',
  ].join('\n\n')
}
