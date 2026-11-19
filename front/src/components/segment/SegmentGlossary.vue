<template>
  <div v-if="entries.length" class="d-flex flex-wrap align-center ga-2">
    <span class="text-label-medium text-medium-emphasis">{{ $t('glossaryRefs.title') }}</span>
    <v-tooltip v-for="g in entries" :key="g.id" location="top">
      <template #activator="{ props: tip }">
        <v-chip
          v-bind="tip"
          size="small"
          variant="tonal"
          prepend-icon="mdi-book-alphabet"
          :aria-label="$t('glossaryRefs.open', { term: g.he })"
          @click="open(g.he)"
        >
          <bdi lang="he" dir="rtl" class="he-inline">{{ g.he }}</bdi>
        </v-chip>
      </template>
      <HebrewText :text="g.fr" />
    </v-tooltip>
  </div>
</template>
<script setup lang="ts">
/** Termes du glossaire cités par un segment : définition au survol, clic → vue Glossaire filtrée. */
import { computed } from 'vue'
import type { GlossaryEntry } from '@/types/tosafot'
import { useTosafot } from '@/composables/useTosafot'
import { useViewNavigation } from '@/composables/useViewNavigation'
import HebrewText from '@/components/common/HebrewText.vue'
const props = defineProps<{ segmentId: string }>()
const { doc, segment } = useTosafot()
const { goTo } = useViewNavigation()
const entries = computed(() => {
  const byId = new Map(doc.value.glossary.map((g) => [g.id, g]))
  return (segment(props.segmentId)?.glossaryRefs ?? [])
    .map((id) => byId.get(id))
    .filter((g): g is GlossaryEntry => Boolean(g))
})
function open(term: string) {
  void goTo('glossary', { q: term })
}
</script>
