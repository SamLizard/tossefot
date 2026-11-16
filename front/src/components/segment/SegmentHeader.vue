<template>
  <div v-if="s" class="d-flex align-center flex-wrap ga-2 text-label-large text-medium-emphasis">
    <span class="font-weight-bold">{{ s.id }}</span>
    <span aria-hidden="true">·</span>
    <span>{{ s.nodeId }}</span>
    <span aria-hidden="true">·</span>
    <RoleChip :role="s.role" size="x-small" />
    <span aria-hidden="true">·</span>
    <HebrewText :text="attributionLabel(s.attribution)" />
    <v-spacer />
    <slot name="actions" />
    <v-btn
      v-if="showSefaria && doc.source.sefariaUrl"
      :href="doc.source.sefariaUrl"
      target="_blank"
      rel="noopener"
      variant="text"
      size="small"
      append-icon="mdi-open-in-new"
      :aria-label="$t('segment.openSefaria')"
    >
      Sefaria
    </v-btn>
  </div>
</template>

<script setup lang="ts">
/** Ligne d'en-tête d'un segment : « s7 · I.3 · [rôle] · attribution » et lien Sefaria. */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import HebrewText from '@/components/common/HebrewText.vue'
import RoleChip from '@/components/common/RoleChip.vue'

const props = withDefaults(defineProps<{ segmentId: string; showSefaria?: boolean }>(), {
  showSefaria: true,
})

const { doc, segment, attributionLabel } = useTosafot()
const s = computed(() => segment(props.segmentId))
</script>
