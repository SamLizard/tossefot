/**
 * Document courant et index de recherche (par id).
 * TosafotPage appelle `provideTosafot(doc)` ; les composants enfants
 * appellent `useTosafot()`.
 */
import { computed, inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type {
  DataTable,
  Person,
  RoleDef,
  Segment,
  Source,
  StructureNode,
  TosafotDoc,
} from '@/types/tosafot'
import { useTheme } from 'vuetify'
import { flattenNodes } from '@/utils/integrity'
import { lighten } from '@/utils/color'

export interface TosafotContext {
  doc: ComputedRef<TosafotDoc>
  /** Nœuds de la structure dans l'ordre du parcours en profondeur. */
  nodes: ComputedRef<StructureNode[]>
  segment: (id: string) => Segment | undefined
  node: (id: string) => StructureNode | undefined
  /** Chemin du nœud racine jusqu'au nœud (inclus), ex. I.3 → [I, I.3]. */
  nodePath: (id: string) => StructureNode[]
  source: (id: string) => Source | undefined
  table: (id: string) => DataTable | undefined
  person: (id: string) => Person | undefined
  role: (id: string) => RoleDef | undefined
  roleColor: (id: string) => string
  attributionLabel: (id: string) => string
}

const KEY: InjectionKey<TosafotContext> = Symbol('tosafot')
const FALLBACK_COLOR = '#64748b'

export function provideTosafot(docRef: Ref<TosafotDoc>): TosafotContext {
  const doc = computed(() => docRef.value)
  const nodes = computed(() => flattenNodes(doc.value.structure))

  const index = <T extends { id: string }>(items: () => T[]) => {
    const map = computed(() => new Map(items().map((item) => [item.id, item])))
    return (id: string) => map.value.get(id)
  }

  const parents = computed(() => {
    const map = new Map<string, string>()
    for (const n of nodes.value) for (const c of n.children ?? []) map.set(c.id, n.id)
    return map
  })

  // Les couleurs du JSON sont prévues pour un fond clair : en thème sombre on les éclaircit.
  const theme = useTheme()
  const isDark = computed(() => theme.current.value.dark)

  const node = index(() => nodes.value)
  const role = index(() => doc.value.meta.roles)
  const attribution = index(() => doc.value.meta.attributions)

  const context: TosafotContext = {
    doc,
    nodes,
    segment: index(() => doc.value.segments),
    node,
    nodePath: (id) => {
      const path: StructureNode[] = []
      for (let cur: string | undefined = id; cur; cur = parents.value.get(cur)) {
        const n = node(cur)
        if (n) path.unshift(n)
      }
      return path
    },
    source: index(() => doc.value.sources),
    table: index(() => doc.value.tables),
    person: index(() => doc.value.people),
    role,
    roleColor: (id) => {
      const color = role(id)?.color ?? FALLBACK_COLOR
      // Éclaircie sur fond sombre, un peu assombrie sur fond clair (contraste ≥ 4.5:1).
      return lighten(color, isDark.value ? 0.45 : -0.25)
    },
    attributionLabel: (id) => attribution(id)?.label ?? id,
  }
  provide(KEY, context)
  return context
}

export function useTosafot(): TosafotContext {
  const context = inject(KEY)
  if (!context) throw new Error('useTosafot() doit être appelé sous TosafotPage')
  return context
}
