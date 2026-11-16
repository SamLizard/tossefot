<template>
  <v-card variant="outlined" class="passage">
    <v-card-item class="pb-0">
      <template #prepend>
        <v-chip size="small" color="secondary" variant="tonal" label prepend-icon="mdi-book-open-variant">
          <bdi lang="he" dir="rtl" class="he-inline">{{ passage.ref }}</bdi>
        </v-chip>
      </template>
      <template v-if="linked" #append>
        <v-btn
          :href="linked.url"
          target="_blank"
          rel="noopener"
          size="small"
          variant="text"
          append-icon="mdi-open-in-new"
        >
          Sefaria
        </v-btn>
      </template>
    </v-card-item>
    <v-card-text>
      <p lang="he" dir="rtl" class="he-block mb-2">{{ passage.text }}</p>
      <HebrewText
        v-if="preferences.showTranslation"
        :text="passage.translation"
        tag="p"
        class="text-body-medium text-medium-emphasis"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
/** Passage de Guemara : hébreu en RTL, traduction, référence et lien vers la source. */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import type { GemaraPassage } from '@/types/tosafot'
import HebrewText from '@/components/common/HebrewText.vue'

const props = defineProps<{ passage: GemaraPassage }>()

const { source } = useTosafot()
const preferences = usePreferences()
const linked = computed(() => (props.passage.sourceId ? source(props.passage.sourceId) : undefined))
</script>

<style scoped>
.passage {
  border-inline-start: 3px solid rgb(var(--v-theme-secondary));
}
</style>
