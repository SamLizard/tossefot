<script setup lang="ts">
/** Résultat de la vérification locale : succès, ou liste des différences et erreurs. */
import type { IntegrityReport } from '@/utils/integrity'
import HebrewText from '@/components/common/HebrewText.vue'
import DiffList from './DiffList.vue'

defineProps<{ report: IntegrityReport }>()
const emit = defineEmits<{ select: [segmentId: string] }>()
</script>

<template>
  <v-alert v-if="report.ok" type="success" variant="tonal" icon="mdi-check-decagram">
    ✓ {{ report.wordCount }} mots, {{ report.segmentCount }} segments, texte complet et structure
    dans l'ordre
  </v-alert>

  <template v-else>
    <v-alert type="error" variant="tonal" class="mb-3">
      Échec : {{ report.diffs.length }} différence(s) de texte, {{ report.errors.length }} erreur(s)
      de structure ou de références ({{ report.wordCount }} mots attendus,
      {{ report.segmentCount }} segments).
    </v-alert>

    <template v-if="report.diffs.length">
      <div class="text-title-small mb-1">Les segments ne reproduisent pas le texte</div>
      <DiffList :diffs="report.diffs" @select="emit('select', $event)" />
    </template>

    <template v-if="report.errors.length">
      <div class="text-title-small mt-3 mb-1">Structure et références</div>
      <v-list density="compact" class="py-0" bg-color="transparent">
        <v-list-item
          v-for="(error, i) in report.errors"
          :key="i"
          prepend-icon="mdi-alert-circle-outline"
          base-color="error"
        >
          <HebrewText :text="error" class="text-body-medium" />
        </v-list-item>
      </v-list>
    </template>
  </template>
</template>
