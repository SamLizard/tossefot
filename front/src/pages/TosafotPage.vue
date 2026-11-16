<script setup lang="ts">
/** Charge le JSON du תוספות puis délègue l'affichage à TosafotReader. */
import { ref, watch } from 'vue'
import { findEntry } from '@/data/catalog'
import type { TosafotDoc } from '@/types/tosafot'
import TosafotReader from './TosafotReader.vue'

const props = defineProps<{ slug: string; view?: string }>()

const doc = ref<TosafotDoc | null>(null)
const status = ref<'loading' | 'ready' | 'unknown' | 'error'>('loading')
const errorMessage = ref('')

watch(
  () => props.slug,
  async (slug) => {
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

<template>
  <TosafotReader v-if="status === 'ready' && doc" :key="slug" :doc="doc" />

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
        :title="status === 'unknown' ? 'תוספות introuvable' : 'Erreur de chargement'"
      >
        <p v-if="status === 'unknown'">
          Aucun fichier ne correspond à « {{ slug }} ».
        </p>
        <p v-else>{{ errorMessage }}</p>
        <template #append>
          <v-btn :to="{ name: 'catalog' }" variant="text" prepend-icon="mdi-bookshelf">
            Voir le catalogue
          </v-btn>
        </template>
      </v-alert>
    </v-container>
  </v-main>
</template>

<style scoped>
.page-container {
  max-width: 960px;
}
</style>
