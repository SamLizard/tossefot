<template>
  <div v-if="n" class="d-flex flex-column ga-4">
    <HebrewText v-if="summary" :text="summary" tag="p" class="text-body-large summary" />

    <v-sheet v-if="n.conclusion" color="surface-variant" rounded="lg" class="d-flex ga-2 pa-3">
      <span class="text-primary font-weight-bold" aria-hidden="true">⇒</span>
      <HebrewText :text="n.conclusion" class="text-body-medium font-weight-medium" />
    </v-sheet>

    <div v-if="segments.length">
      <div class="text-label-large text-medium-emphasis mb-1">{{ $t('node.segments', { count: segments.length }) }}</div>
      <v-list density="compact" bg-color="transparent" class="py-0">
        <v-list-item
          v-for="s in segments"
          :key="s.id"
          rounded="lg"
          class="px-2"
          @click="openSegment(s.id)"
        >
          <template #prepend>
            <span class="text-label-medium text-medium-emphasis me-3">{{ s.id }}</span>
          </template>
          <p lang="he" dir="rtl" class="he-block he-tosafot segment-preview">{{ s.he }}</p>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script setup lang="ts">
/** Contenu du panneau pour un nœud de la structure : résumé, conclusion, segments. */
import { computed } from 'vue'
import type { Segment } from '@/types/tosafot'
import { pickLevel } from '@/utils/levels'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import HebrewText from '@/components/common/HebrewText.vue'

const props = defineProps<{ nodeId: string }>()

const { node, segment } = useTosafot()
const preferences = usePreferences()
const { openSegment } = useSegmentPanel()

const n = computed(() => node(props.nodeId))
const summary = computed(() => pickLevel(n.value?.summary, preferences.level))
const segments = computed(() =>
  (n.value?.segmentIds ?? []).map((id) => segment(id)).filter((s): s is Segment => Boolean(s)),
)
</script>

<style scoped>
.summary {
  line-height: 1.7;
}
.segment-preview {
  font-size: 1.1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
