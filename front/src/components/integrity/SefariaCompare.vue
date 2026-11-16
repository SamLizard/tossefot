<script setup lang="ts">
/** Comparaison optionnelle de fullText avec le texte en direct de Sefaria. */
import type { SefariaState } from '@/composables/useIntegrity'
import DiffList from './DiffList.vue'

defineProps<{ state: SefariaState; url: string }>()
const emit = defineEmits<{ run: [] }>()
</script>

<template>
  <div class="d-flex align-center flex-wrap ga-2 mb-3">
    <v-btn
      variant="outlined"
      color="primary"
      prepend-icon="mdi-cloud-sync-outline"
      :loading="state.status === 'loading'"
      @click="emit('run')"
    >
      Comparer avec Sefaria
    </v-btn>
    <a :href="url" target="_blank" rel="noopener" class="text-label-small text-medium-emphasis">
      {{ url }}
    </a>
  </div>

  <v-alert
    v-if="state.status === 'failed'"
    type="warning"
    variant="tonal"
    title="Sefaria inaccessible"
  >
    {{ state.message }}. Hors ligne ou appel bloqué par le navigateur (CORS) : la vérification
    locale ci-dessus reste valable.
  </v-alert>

  <template v-else-if="state.status === 'done'">
    <v-alert v-if="!state.diffs.length" type="success" variant="tonal">
      ✓ Le texte du JSON est identique au texte de Sefaria.
    </v-alert>
    <template v-else>
      <v-alert type="error" variant="tonal" class="mb-2">
        Le texte du JSON diffère de Sefaria ({{ state.diffs.length }} différence(s)).
      </v-alert>
      <DiffList :diffs="state.diffs" />
    </template>
  </template>
</template>
