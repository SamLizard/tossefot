/**
 * Panneau latéral partagé : segment (ou nœud) sélectionné, table ouverte en modale,
 * et segment surligné après un clic dans « Vérifier le texte ».
 */
import { nextTick, ref } from 'vue'

const selectedSegmentId = ref<string | null>(null)
const selectedNodeId = ref<string | null>(null)
const openTableId = ref<string | null>(null)
const highlightedSegmentId = ref<string | null>(null)

export function useSegmentPanel() {
  function openSegment(id: string) {
    selectedNodeId.value = null
    selectedSegmentId.value = id
  }

  function openNode(id: string) {
    selectedSegmentId.value = null
    selectedNodeId.value = id
  }

  function closePanel() {
    selectedSegmentId.value = null
    selectedNodeId.value = null
  }

  function openTable(id: string) {
    openTableId.value = id
  }

  function closeTable() {
    openTableId.value = null
  }

  /** Défile vers l'élément `[data-segment-id]` visible et le surligne quelques secondes. */
  async function scrollToSegment(id: string) {
    highlightedSegmentId.value = id
    await nextTick()
    document
      .querySelector(`[data-segment-id="${CSS.escape(id)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      if (highlightedSegmentId.value === id) highlightedSegmentId.value = null
    }, 3000)
  }

  return {
    selectedSegmentId,
    selectedNodeId,
    openTableId,
    highlightedSegmentId,
    openSegment,
    openNode,
    closePanel,
    openTable,
    closeTable,
    scrollToSegment,
  }
}
