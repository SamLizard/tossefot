<script setup lang="ts">
/**
 * Un segment du texte continu (docs/UI_SPEC.md §3.2) : <span> cliquable,
 * souligné de la couleur de son rôle, infobulle avec l'explication essentielle.
 */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import { pickLevel } from '@/utils/levels'
import HebrewText from '@/components/common/HebrewText.vue'

const props = defineProps<{ segmentId: string }>()

const { segment, roleColor } = useTosafot()
const preferences = usePreferences()
const { selectedSegmentId, selectedNodeId, highlightedSegmentId, openSegment } = useSegmentPanel()

const current = computed(() => segment(props.segmentId))
const tooltip = computed(() => pickLevel(current.value?.explanation, 'essentiel'))
const selected = computed(
  () =>
    selectedSegmentId.value === props.segmentId ||
    (!!selectedNodeId.value && selectedNodeId.value === current.value?.nodeId),
)
const style = computed(() => ({ '--role-color': roleColor(current.value?.role ?? '') }))
</script>

<template>
  <span
    v-if="current"
    class="text-segment"
    :class="{
      'with-color': preferences.roleColors,
      selected,
      'segment-flash': highlightedSegmentId === segmentId,
    }"
    :style="style"
    :data-segment-id="segmentId"
    role="button"
    tabindex="0"
    :aria-label="`Segment ${segmentId}`"
    @click="openSegment(segmentId)"
    @keydown.enter.prevent="openSegment(segmentId)"
    @keydown.space.prevent="openSegment(segmentId)"
  >{{ current.he }}<v-tooltip v-if="tooltip" activator="parent" :open-delay="350">
      <!-- L'infobulle est téléportée hors du bloc RTL : elle reste en français (LTR). -->
      <HebrewText :text="tooltip" class="text-body-medium" />
    </v-tooltip></span>
</template>

<style scoped>
.text-segment {
  cursor: pointer;
  border-radius: 4px;
  padding: 0.05em 0.1em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  transition: background-color 0.15s;
}
.text-segment.with-color {
  text-decoration-line: underline;
  text-decoration-color: color-mix(in srgb, var(--role-color) 75%, transparent);
  text-decoration-thickness: 2px;
  text-underline-offset: 0.4em;
}
.text-segment:hover,
.text-segment:focus-visible {
  background-color: color-mix(in srgb, var(--role-color) 10%, transparent);
  outline: none;
}
.text-segment.selected {
  background-color: color-mix(in srgb, var(--role-color) 18%, transparent);
}
</style>
