<template>
  <TosafotReader v-if="status === 'ready' && doc" :key="`${slug}@${localStamp}`" :doc="doc" />

  <v-main v-else>
    <v-container class="page-container py-10">
      <div v-if="status === 'loading'" class="d-flex flex-column align-center ga-6">
        <v-progress-circular indeterminate color="primary" size="48" />
        <v-skeleton-loader class="w-100" type="heading, paragraph, paragraph" color="transparent" />
      </div>

      <v-alert
        v-else
        :type="status === 'unknown' ? 'warning' : 'error'"
        variant="tonal"
        :title="status === 'unknown' ? $t('tosafotPage.notFoundTitle') : $t('tosafotPage.errorTitle')"
      >
        <p v-if="status === 'unknown'">{{ $t('tosafotPage.notFoundMessage', { slug }) }}</p>
        <p v-else>{{ errorMessage }}</p>
        <template #append>
          <v-btn :to="{ name: 'catalog' }" variant="text" prepend-icon="mdi-bookshelf">
            {{ $t('tosafotPage.backToCatalog') }}
          </v-btn>
        </template>
      </v-alert>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
/** Charge le JSON du תוספות puis délègue l'affichage à TosafotReader. */
import { computed, ref, watch } from 'vue'
import { findEntry } from '@/data/catalog'
import type { TosafotDoc } from '@/types/tosafot'
import TosafotReader from './TosafotReader.vue'

const props = defineProps<{ slug: string; view?: string }>()

const doc = ref<TosafotDoc | null>(null)
const status = ref<'loading' | 'ready' | 'unknown' | 'error'>('loading')
const errorMessage = ref('')
// Une version locale rechargée sous le même slug doit être relue.
const localStamp = computed(() => findEntry(props.slug)?.local?.importedAt ?? '')

watch(
  () => [props.slug, localStamp.value] as const,
  async ([slug]) => {
    doc.value = null
    const entry = findEntry(slug)
    if (!entry) {
      status.value = 'unknown'
      return
    }
    status.value = 'loading'
    try {
      const loaded = await entry.load()
      if (slug !== props.slug) return
      doc.value = loaded
      status.value = 'ready'
    } catch (e) {
      errorMessage.value = e instanceof Error ? e.message : String(e)
      status.value = 'error'
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.page-container {
  max-width: 960px;
}
</style>
