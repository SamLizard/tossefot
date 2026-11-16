/**
 * Nœuds dépliés de la vue « Structure », gardés dans l'URL (`?open=I,II.A`)
 * pour pouvoir partager un lien (docs/UI_SPEC.md §3.1).
 */
import { computed } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import { useTosafot } from '@/composables/useTosafot'

export function useOpenNodes() {
  const route = useRoute()
  const router = useRouter()
  const { nodes } = useTosafot()

  const openIds = computed(() => {
    const raw = route.query.open
    const value = Array.isArray(raw) ? raw[0] : raw
    return new Set((value ?? '').split(',').filter(Boolean))
  })

  const allOpen = computed(() => nodes.value.every((n) => openIds.value.has(n.id)))

  function isOpen(id: string): boolean {
    return openIds.value.has(id)
  }

  /** Écrit la liste dans l'URL, dans l'ordre du texte, sans toucher aux autres paramètres. */
  function setOpen(ids: Set<string>) {
    const ordered = nodes.value.map((n) => n.id).filter((id) => ids.has(id))
    const query: LocationQuery = { ...route.query }
    if (ordered.length) query.open = ordered.join(',')
    else delete query.open
    void router.replace({ query })
  }

  function toggle(id: string) {
    const next = new Set(openIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setOpen(next)
  }

  function openAll() {
    setOpen(new Set(nodes.value.map((n) => n.id)))
  }

  function closeAll() {
    setOpen(new Set())
  }

  return { openIds, allOpen, isOpen, toggle, openAll, closeAll }
}
