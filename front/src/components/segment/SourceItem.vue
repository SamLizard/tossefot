<template>
  <div class="d-flex flex-column ga-1">
    <div class="d-flex flex-wrap align-center ga-2">
      <bdi lang="he" dir="rtl" class="he-inline text-title-small font-weight-bold">{{ source.ref }}</bdi>
      <v-chip
        :href="href"
        target="_blank"
        rel="noopener"
        size="small"
        variant="outlined"
        append-icon="mdi-open-in-new"
        :aria-label="$t('sources.openLocation', { label: locationLabel })"
      >
        <HebrewText :text="locationLabel" />
      </v-chip>
    </div>
    <HebrewText v-if="source.role" :text="source.role" tag="div" class="text-body-small text-medium-emphasis" />
    <v-sheet
      v-if="source.quote"
      tag="figure"
      rounded="sm"
      class="source-quote pa-2 mt-1"
      :aria-label="$t('sources.quote')"
    >
      <p lang="he" dir="rtl" class="he-block source-quote__he">{{ source.quote.he }}</p>
      <HebrewText
        v-if="source.quote.fr"
        :text="source.quote.fr"
        tag="p"
        class="text-body-small text-medium-emphasis font-italic mt-1"
      />
    </v-sheet>
  </div>
</template>
<script setup lang="ts">
/** Une source citée : référence, rôle, citation (hébreu + traduction) et lien vers le passage. */
import { computed } from 'vue'
import type { Source } from '@/types/tosafot'
import HebrewText from '@/components/common/HebrewText.vue'
const props = defineProps<{ source: Source }>()
// URL du JSON uniquement (jamais construite) : passage précis, sinon la page.
const href = computed(() => props.source.location?.url ?? props.source.url)
const locationLabel = computed(() => props.source.location?.label ?? props.source.sefaria)
</script>
<style scoped>
.source-quote {
  margin: 0;
  background: rgba(var(--v-theme-primary), 0.05);
  border-inline-start: 3px solid rgba(var(--v-theme-primary), 0.45);
}
.source-quote__he {
  font-size: 1.05rem;
  line-height: 1.7;
}
</style>
