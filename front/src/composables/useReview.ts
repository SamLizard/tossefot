/**
 * Remarques de relecture du document courant (docs/JSON_IDEAS.md §4).
 * Gardées en localStorage par `meta.id` : une version locale corrigée (même meta.id)
 * retrouve donc les remarques faites sur la version précédente.
 * Le nom du relecteur est gardé une seule fois, pour tous les documents.
 */
import { computed, effectScope, reactive, ref, watch } from 'vue'
import type { CommentDraft, CommentStatus, CommentTarget, ReviewComment } from '@/types/review'
import { useTosafot } from '@/composables/useTosafot'
import { applyReviewLog, buildReviewFile, isPending, mergeComments, nextCommentId, parseReviewFile } from '@/utils/reviewFile'
import { buildTargetOrder, targetKey } from '@/utils/reviewFields'
import { takeSnapshot, type DocSnapshot } from '@/utils/reviewDiff'
import { buildReviewPrompt } from '@/utils/reviewPrompt'
import { downloadText } from '@/utils/download'

const PREFIX = 'tossefot.review.v1.'
const REVIEWER_KEY = 'tossefot.reviewer.v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/**
 * Remarques par document, chargées à la première demande puis enregistrées à chaque changement.
 * Map non réactive de tableaux réactifs : la créer depuis un computed ne déclenche rien.
 */
const stores = new Map<string, ReviewComment[]>()
const reviewer = ref<string>(read(REVIEWER_KEY, ''))
watch(reviewer, (name) => localStorage.setItem(REVIEWER_KEY, JSON.stringify(name)))
// Les watchers d'enregistrement vivent aussi longtemps que l'application, pas qu'un composant.
const scope = effectScope(true)

function store(docId: string): ReviewComment[] {
  let list = stores.get(docId)
  if (!list) {
    const created = reactive(read<ReviewComment[]>(PREFIX + docId, []))
    stores.set(docId, created)
    scope.run(() =>
      watch(created, (value) => localStorage.setItem(PREFIX + docId, JSON.stringify(value)), { deep: true }),
    )
    list = created
  }
  return list
}

/** Incrémenté à chaque nouvel instantané (localStorage n'est pas réactif). */
const snapshotTick = ref(0)

export function loadSnapshot(docId: string): DocSnapshot | null {
  return read<DocSnapshot | null>(`${PREFIX}${docId}.snapshot`, null)
}

const nowIso = () => new Date().toISOString()

export function useReview() {
  const { doc } = useTosafot()
  const docId = computed(() => doc.value.meta.id)
  const comments = computed(() => store(docId.value))
  const order = computed(() => buildTargetOrder(doc.value))

  /** Toutes les remarques, dans l'ordre du texte puis par date. */
  const all = computed(() =>
    [...comments.value].sort(
      (a, b) =>
        (order.value.get(targetKey(a.target)) ?? Infinity) - (order.value.get(targetKey(b.target)) ?? Infinity) ||
        a.createdAt.localeCompare(b.createdAt),
    ),
  )

  const counts = computed(() => {
    const byStatus: Partial<Record<CommentStatus, number>> = {}
    for (const c of comments.value) byStatus[c.status] = (byStatus[c.status] ?? 0) + 1
    return { total: comments.value.length, pending: comments.value.filter(isPending).length, byStatus }
  })

  /** Remarques sur le même élément (quel que soit le champ). */
  function byTarget(target: CommentTarget): ReviewComment[] {
    const key = targetKey(target)
    return all.value.filter((c) => targetKey(c.target) === key)
  }

  function add(draft: CommentDraft): ReviewComment {
    const now = nowIso()
    const comment: ReviewComment = { ...draft, id: nextCommentId(comments.value), status: 'ouvert', createdAt: now, updatedAt: now }
    if (!comment.quote) delete comment.quote
    comments.value.push(comment)
    return comment
  }

  function update(id: string, patch: Partial<Omit<ReviewComment, 'id' | 'createdAt'>>): void {
    const comment = comments.value.find((c) => c.id === id)
    if (comment) Object.assign(comment, patch, { updatedAt: nowIso() })
  }

  function remove(id: string): void {
    const list = comments.value
    const index = list.findIndex((c) => c.id === id)
    if (index >= 0) list.splice(index, 1)
  }

  function clear(): void {
    comments.value.splice(0)
  }

  function reviewFile() {
    return buildReviewFile(doc.value.meta, reviewer.value, all.value)
  }

  /** Après un export ou une copie : les remarques ouvertes sont « envoyées », et on garde l'état du texte. */
  function markSent(): void {
    const now = nowIso()
    for (const c of comments.value) if (c.status === 'ouvert') Object.assign(c, { status: 'envoye', updatedAt: now })
    const snapshot = takeSnapshot(doc.value, reviewFile().baseVersion)
    localStorage.setItem(`${PREFIX}${docId.value}.snapshot`, JSON.stringify(snapshot))
    snapshotTick.value++
  }

  function exportFile(): void {
    const file = reviewFile()
    downloadText(`${docId.value}.review.json`, JSON.stringify(file, null, 2))
    markSent()
  }

  function prompt(): string {
    return buildReviewPrompt(reviewFile(), { jsonFileName: `${docId.value}.json`, title: doc.value.meta.title })
  }

  /** Restaure une sauvegarde ou fusionne le fichier d'un autre relecteur. Retourne le nombre ajouté. */
  async function importFile(file: File): Promise<number> {
    const parsed = parseReviewFile(await file.text())
    const { comments: merged, added } = mergeComments(comments.value, parsed.comments, nowIso())
    comments.value.splice(0, comments.value.length, ...merged)
    if (!reviewer.value && parsed.reviewer) reviewer.value = parsed.reviewer
    return added
  }

  /** Lit le `reviewLog` du document courant et met à jour les remarques. */
  function applyLog(): number {
    return applyReviewLog(comments.value, doc.value.reviewLog ?? [], nowIso())
  }

  function downloadCurrentJson(): void {
    downloadText(`${docId.value}.json`, JSON.stringify(doc.value, null, 2))
  }

  return {
    reviewer,
    all,
    counts,
    byTarget,
    add,
    update,
    remove,
    clear,
    exportFile,
    markSent,
    prompt,
    importFile,
    applyLog,
    downloadCurrentJson,
    /** État du texte au dernier envoi (null si rien n'a encore été envoyé). */
    snapshot: computed(() => {
      void snapshotTick.value
      return loadSnapshot(docId.value)
    }),
  }
}
