<template>
  <v-card
    v-if="current"
    :variant="isRoot ? 'outlined' : 'flat'"
    :color="isRoot ? undefined : 'transparent'"
    :rounded="isRoot ? 'lg' : 0"
    :class="isRoot ? 'pa-3 pa-sm-4' : 'node-child py-1'"
    :style="{ '--role-color': color }"
  >
    <StructureNodeHeader
      :node-id="nodeId"
      :open="open"
      :depth="depth"
      @toggle="toggle(nodeId)"
      @info="openNode(nodeId)"
    />

    <div class="node-body">
      <HebrewText
        v-if="summary"
        :text="summary"
        tag="p"
        class="text-body-medium text-medium-emphasis mt-1 summary"
      />
      <v-expand-transition>
        <div v-if="open" class="node-content mt-3 d-flex flex-column ga-3">
          <SegmentCard v-for="id in current.segmentIds" :key="id" :segment-id="id" />
          <StructureNode
            v-for="child in current.children ?? []"
            :key="child.id"
            :node-id="child.id"
            :depth="depth + 1"
          />
        </div>
      </v-expand-transition>

      <!-- Après les enfants, comme dans le plan du cours (§3.1). -->
      <v-alert
        v-if="current.conclusion"
        variant="tonal"
        color="primary"
        density="compact"
        class="mt-2"
      >
        <template #prepend><span class="text-title-medium" aria-hidden="true">⇒</span></template>
        <HebrewText :text="current.conclusion" class="text-body-medium font-weight-medium" />
      </v-alert>
    </div>
  </v-card>
</template>

<script setup lang="ts">
/**
 * Nœud de la structure (docs/UI_SPEC.md §3.1), récursif.
 * Déplié : les segments du nœud dans l'ordre, puis les enfants.
 */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import { useOpenNodes } from '@/composables/useOpenNodes'
import { pickLevel } from '@/utils/levels'
import HebrewText from '@/components/common/HebrewText.vue'
import SegmentCard from '@/components/segment/SegmentCard.vue'
import StructureNodeHeader from './StructureNodeHeader.vue'

const props = withDefaults(defineProps<{ nodeId: string; depth?: number }>(), { depth: 0 })

const { node, roleColor } = useTosafot()
const preferences = usePreferences()
const { openNode } = useSegmentPanel()
const { isOpen, toggle } = useOpenNodes()

const current = computed(() => node(props.nodeId))
const open = computed(() => isOpen(props.nodeId))
const summary = computed(() => pickLevel(current.value?.summary, preferences.level))
const color = computed(() => roleColor(current.value?.role ?? ''))
const isRoot = computed(() => props.depth === 0)
</script>

<style scoped>
.node-body {
  padding-inline-start: 2.6rem;
}
.summary {
  line-height: 1.6;
}
/* Ligne verticale de la couleur du rôle, qui relie le nœud à ses enfants. */
.node-child {
  border-inline-start: 3px solid color-mix(in srgb, var(--role-color) 55%, transparent);
  padding-inline-start: 0.75rem;
  margin-inline-start: 0.25rem;
}
.node-content {
  padding-bottom: 0.25rem;
}
</style>
