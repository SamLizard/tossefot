<template>
  <v-card variant="outlined">
    <v-card-text class="d-flex ga-3">
      <v-avatar size="28" color="primary" variant="tonal" class="text-label-large flex-shrink-0">
        {{ index + 1 }}
      </v-avatar>
      <div class="flex-1-1">
        <HebrewText :text="question.q" tag="p" class="text-body-large font-weight-medium" />
        <v-expand-transition>
          <v-sheet v-if="shown" color="surface-variant" rounded="lg" class="pa-3 mt-3">
            <HebrewText :text="question.a" tag="p" class="text-body-medium" />
            <div v-if="question.segmentIds?.length" class="d-flex flex-wrap align-center ga-1 mt-2">
              <span class="text-label-medium">{{ $t('synthesis.seeSegments') }}</span>
              <v-chip
                v-for="id in question.segmentIds"
                :key="id"
                size="small"
                variant="outlined"
                :aria-label="$t('synthesis.openSegment', { id })"
                @click="openSegment(id)"
              >
                {{ id }}
              </v-chip>
            </div>
          </v-sheet>
        </v-expand-transition>
      </div>
    </v-card-text>
    <v-card-actions class="pt-0 justify-end">
      <v-btn
        :prepend-icon="shown ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        :aria-expanded="shown"
        @click="shown = !shown"
      >
        {{ shown ? $t('review.hide') : $t('review.show') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
/** Question de révision ; la réponse est cachée jusqu'au clic. */
import { ref } from 'vue'
import type { ReviewQuestion } from '@/types/tosafot'
import HebrewText from '@/components/common/HebrewText.vue'
import { useSegmentPanel } from '@/composables/useSegmentPanel'

defineProps<{ question: ReviewQuestion; index: number }>()
const shown = ref(false)
const { openSegment } = useSegmentPanel()
</script>
