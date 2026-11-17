/** Dialogue « Commenter » partagé : un seul CommentDialog, ouvert par tous les boutons. */
import { ref } from 'vue'
import type { CommentTarget } from '@/types/review'

const target = ref<CommentTarget | null>(null)
const quote = ref('')
/** Remarque à modifier dès l'ouverture (depuis la page Relecture). */
const editId = ref<string | null>(null)

const MAX_QUOTE = 600

/** Texte sélectionné dans la page, s'il y en a un (sert de citation). */
export function currentSelection(): string {
  const text = window.getSelection()?.toString().replace(/\s+/g, ' ').trim() ?? ''
  return text.length <= MAX_QUOTE ? text : text.slice(0, MAX_QUOTE) + '…'
}

export function useCommentDialog() {
  function openFor(next: CommentTarget, selection = '', commentId: string | null = null) {
    target.value = { ...next }
    quote.value = selection
    editId.value = commentId
  }

  function close() {
    target.value = null
    quote.value = ''
    editId.value = null
  }

  return { target, quote, editId, openFor, close }
}
