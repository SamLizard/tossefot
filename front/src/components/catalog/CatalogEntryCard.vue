<template>
  <v-card
    variant="outlined"
    :to="{ name: 'tosafot', params: { slug: entry.slug } }"
    class="entry-card"
  >
    <v-card-item>
      <template #prepend>
        <v-avatar color="primary" variant="tonal" icon="mdi-book-open-page-variant" />
      </template>
      <template v-if="current.status === 'ready'">
        <HebrewText :text="current.meta.title" tag="div" class="entry-title" />
        <HebrewText :text="subtitle" tag="div" class="text-label-large text-medium-emphasis mt-1" />
      </template>
      <v-skeleton-loader
        v-else-if="current.status === 'loading'"
        type="list-item-two-line"
        color="transparent"
      />
      <div v-else class="text-body-medium text-error">{{ $t('catalog.unreadable') }}</div>
    </v-card-item>
    <v-card-actions class="pt-0">
      <span class="text-label-small text-medium-emphasis ms-2">{{ entry.slug }}</span>
      <LocalDocActions v-if="entry.local" :info="entry.local" />
      <v-spacer />
      <v-btn variant="text" color="primary" append-icon="mdi-arrow-right">
        {{ $t('catalog.open') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
/** Carte d'un תוספות du catalogue ; le titre est chargé à la demande. */
import { computed, onMounted } from 'vue'
import type { CatalogEntry } from '@/data/catalog'
import { useCatalogMeta } from '@/composables/useCatalogMeta'
import HebrewText from '@/components/common/HebrewText.vue'
import LocalDocActions from './LocalDocActions.vue'

const props = defineProps<{ entry: CatalogEntry }>()

const { load, state } = useCatalogMeta()
onMounted(() => load(props.entry))
const current = computed(() => state(props.entry.slug))
const subtitle = computed(() => {
  const s = current.value
  return s.status === 'ready' ? [s.meta.masechet, s.meta.daf, s.meta.perek].join(' · ') : ''
})
</script>

<style scoped>
.entry-title {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.4;
}
.entry-card {
  border-inline-start: 4px solid rgb(var(--v-theme-secondary));
}
</style>
