/** État du dialogue « Vérifier le texte » (docs/UI_SPEC.md §7). */
import { ref, shallowRef } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { checkIntegrity, compareWithSefaria, type IntegrityReport, type TextDiff } from '@/utils/integrity'
import { sefariaApiUrl } from '@/utils/sefaria'

export type SefariaState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; diffs: TextDiff[] }
  | { status: 'failed'; message: string }

export function useIntegrity() {
  const { doc } = useTosafot()
  const report = shallowRef<IntegrityReport | null>(null)
  const sefaria = ref<SefariaState>({ status: 'idle' })

  /** Vérification locale : synchrone et sans réseau. */
  function runLocal() {
    report.value = checkIntegrity(doc.value)
    sefaria.value = { status: 'idle' }
  }

  async function runSefaria() {
    sefaria.value = { status: 'loading' }
    try {
      const diffs = await compareWithSefaria(doc.value, sefariaApiUrl(doc.value.source.ref))
      sefaria.value = { status: 'done', diffs }
    } catch (e) {
      // Hors ligne, CORS ou API modifiée : on l'affiche sans toucher au résultat local.
      const message = e instanceof Error ? e.message : String(e)
      sefaria.value = { status: 'failed', message }
    }
  }

  return { report, sefaria, runLocal, runSefaria, sefariaUrl: () => sefariaApiUrl(doc.value.source.ref) }
}
