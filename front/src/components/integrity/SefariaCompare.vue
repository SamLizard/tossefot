<template>
  <div class="d-flex align-center flex-wrap ga-2 mb-3">
    <v-btn
      variant="outlined"
      color="primary"
      prepend-icon="mdi-cloud-sync-outline"
      :loading="state.status === 'loading'"
      @click="emit('run')"
    >
      {{ $t('integrity.compare') }}
    </v-btn>
    <a :href="url" target="_blank" rel="noopener" class="text-label-small text-medium-emphasis">
      {{ url }}
    </a>
  </div>

  <v-alert
    v-if="state.status === 'failed'"
    type="warning"
    variant="tonal"
    :title="$t('integrity.unreachableTitle')"
  >
    {{ $t('integrity.unreachable', { message: state.message }) }}
  </v-alert>

  <template v-else-if="state.status === 'done'">
    <v-alert v-if="!state.diffs.length" type="success" variant="tonal">
      {{ $t('integrity.same') }}
    </v-alert>
    <template v-else>
      <v-alert type="error" variant="tonal" class="mb-2">
        {{ $t('integrity.differs', { count: state.diffs.length }) }}
      </v-alert>
      <DiffList :diffs="state.diffs" />
    </template>
  </template>
</template>

<script setup lang="ts">
/** Comparaison optionnelle de fullText avec le texte en direct de Sefaria. */
import type { SefariaState } from '@/composables/useIntegrity'
import DiffList from './DiffList.vue'

defineProps<{ state: SefariaState; url: string }>()
const emit = defineEmits<{ run: [] }>()
</script>
