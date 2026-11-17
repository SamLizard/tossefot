<template>
  <div v-if="s" class="d-flex flex-column ga-4">
    <HebrewText
      v-if="preferences.showTranslation && s.translation"
      :text="s.translation"
      tag="p"
      class="text-body-large text-medium-emphasis translation"
    />

    <SegmentExplanation :explanation="s.explanation" />

    <div v-if="tables.length" class="d-flex flex-wrap ga-2">
      <v-btn
        v-for="t in tables"
        :key="t.id"
        variant="tonal"
        color="secondary"
        size="small"
        prepend-icon="mdi-table"
        class="table-btn"
        @click="openTable(t.id)"
      >
        <HebrewText :text="$t('details.viewTable', { title: t.title })" />
      </v-btn>
    </div>

    <v-expansion-panels
      v-if="s.terms.length || notes.length || s.sourceIds.length"
      multiple
      variant="accordion"
      flat
      class="details-panels"
    >
      <v-expansion-panel v-if="s.terms.length">
        <v-expansion-panel-title>
          <v-icon icon="mdi-translate" size="small" class="me-2" />
          {{ $t('details.words', { count: s.terms.length }) }}
        </v-expansion-panel-title>
        <v-expansion-panel-text><SegmentTerms :terms="s.terms" /></v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel v-if="notes.length">
        <v-expansion-panel-title>
          <v-icon icon="mdi-alert" color="warning" size="small" class="me-2" />
          {{ $t('details.notes', { count: notes.length }) }}
        </v-expansion-panel-title>
        <v-expansion-panel-text><SegmentNotes :notes="notes" /></v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel v-if="s.sourceIds.length">
        <v-expansion-panel-title>
          <v-icon icon="mdi-book-open-variant" size="small" class="me-2" />
          {{ $t('details.sources', { count: s.sourceIds.length }) }}
        </v-expansion-panel-title>
        <v-expansion-panel-text><SegmentSources :source-ids="s.sourceIds" /></v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
/**
 * Détails d'un segment (docs/UI_SPEC.md §4) : traduction, explication, mots, notes, sources, tables.
 * Partagé par SegmentCard et SegmentPanel. Les sections vides sont masquées.
 */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import HebrewText from '@/components/common/HebrewText.vue'
import SegmentExplanation from '@/components/segment/SegmentExplanation.vue'
import SegmentTerms from '@/components/segment/SegmentTerms.vue'
import SegmentNotes from '@/components/segment/SegmentNotes.vue'
import SegmentSources from '@/components/segment/SegmentSources.vue'

const props = defineProps<{ segmentId: string }>()

const { segment, table } = useTosafot()
const preferences = usePreferences()
const { openTable } = useSegmentPanel()

const s = computed(() => segment(props.segmentId))
const notes = computed(() => s.value?.notes ?? [])
const tables = computed(() =>
  (s.value?.tableIds ?? []).map((id) => ({ id, title: table(id)?.title ?? id })),
)
</script>

<style scoped>
.translation {
  line-height: 1.7;
  font-style: italic;
}
/* Les titres de table sont longs : le bouton passe à la ligne au lieu de couper le texte. */
.table-btn {
  height: auto !important;
  min-height: 32px;
  max-width: 100%;
  padding-block: 6px;
  text-align: start;
}
.table-btn :deep(.v-btn__content) {
  white-space: normal;
  flex: 1 1 auto;
  min-width: 0;
}
.details-panels {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}
</style>
