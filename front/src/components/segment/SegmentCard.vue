<script setup lang="ts">
/** Carte d'un segment (docs/UI_SPEC.md §4) : en-tête, texte hébreu, détails. */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import SegmentHeader from '@/components/segment/SegmentHeader.vue'
import TosafotHebrew from '@/components/segment/TosafotHebrew.vue'
import SegmentDetails from '@/components/segment/SegmentDetails.vue'

const props = defineProps<{ segmentId: string }>()

const { segment, roleColor } = useTosafot()
const preferences = usePreferences()
const { highlightedSegmentId } = useSegmentPanel()

const s = computed(() => segment(props.segmentId))
const accent = computed(() =>
  s.value && preferences.roleColors ? roleColor(s.value.role) : 'transparent',
)
</script>

<template>
  <v-card
    v-if="s"
    variant="outlined"
    :data-segment-id="s.id"
    :class="['segment-card', { 'segment-flash': highlightedSegmentId === s.id }]"
    :style="{ '--segment-accent': accent }"
  >
    <v-card-item class="pb-0">
      <SegmentHeader :segment-id="s.id" />
    </v-card-item>
    <v-card-text class="d-flex flex-column ga-4 pt-3">
      <TosafotHebrew :segment-id="s.id" class="segment-he" />
      <v-divider />
      <SegmentDetails :segment-id="s.id" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.segment-card {
  border-color: rgba(var(--v-border-color), 0.14);
  border-inline-start: 4px solid var(--segment-accent);
}
.segment-he {
  font-size: 1.55rem;
  line-height: 2;
  color: rgb(var(--v-theme-on-surface));
}
</style>
