<template>
  <div v-if="links.length" class="d-flex flex-wrap ga-2">
    <v-btn
      v-for="l in links"
      :key="l.labelKey"
      :href="l.url"
      target="_blank"
      rel="noopener"
      variant="outlined"
      color="primary"
      size="small"
      :prepend-icon="l.icon"
      append-icon="mdi-open-in-new"
    >
      {{ $t(l.labelKey) }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
/** Liens externes d'une personne. Les URL viennent du JSON (vérifiées) : ne jamais en construire. */
import { computed } from 'vue'
import type { PersonLinks } from '@/types/tosafot'

const props = defineProps<{ links?: PersonLinks }>()

const links = computed(() =>
  [
    { labelKey: 'people.wikipediaHe', icon: 'mdi-wikipedia', url: props.links?.wikipedia_he },
    { labelKey: 'people.wikipediaFr', icon: 'mdi-wikipedia', url: props.links?.wikipedia_fr },
    { labelKey: 'people.sefaria', icon: 'mdi-bookshelf', url: props.links?.sefaria },
  ].filter((l): l is { labelKey: string; icon: string; url: string } => Boolean(l.url)),
)
</script>
