<template>
  <div v-if="segmentIds.length" class="d-flex flex-wrap align-center ga-1">
    <span class="text-label-large text-medium-emphasis me-1">{{ $t('people.appearsIn') }}</span>
    <v-chip
      v-for="id in segmentIds"
      :key="id"
      size="x-small"
      variant="outlined"
      label
      :aria-label="$t('people.inSegment', { id })"
      @click="open(id)"
    >
      {{ id }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
/** « Apparaît dans : s10, s15… » : un clic ouvre le segment dans le panneau et ferme la fiche. */
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import { usePersonDialog } from '@/composables/usePersonDialog'

defineProps<{ segmentIds: string[] }>()

const { openSegment } = useSegmentPanel()
const { closePerson } = usePersonDialog()

function open(id: string) {
  closePerson()
  openSegment(id)
}
</script>
