<template>
  <v-alert v-if="report.ok" type="success" variant="tonal" icon="mdi-check-decagram">
    {{ $t('integrity.ok', { words: report.wordCount, segments: report.segmentCount }) }}
  </v-alert>

  <template v-else>
    <v-alert type="error" variant="tonal" class="mb-3">
      {{
        $t('integrity.failed', {
          diffs: report.diffs.length,
          errors: report.errors.length,
          words: report.wordCount,
          segments: report.segmentCount,
        })
      }}
    </v-alert>

    <template v-if="report.diffs.length">
      <div class="text-title-small mb-1">{{ $t('integrity.diffsTitle') }}</div>
      <DiffList :diffs="report.diffs" @select="emit('select', $event)" />
    </template>

    <template v-if="report.errors.length">
      <div class="text-title-small mt-3 mb-1">{{ $t('integrity.errorsTitle') }}</div>
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

<script setup lang="ts">
/** Résultat de la vérification locale : succès, ou liste des différences et erreurs. */
import type { IntegrityReport } from '@/utils/integrity'
import HebrewText from '@/components/common/HebrewText.vue'
import DiffList from './DiffList.vue'

defineProps<{ report: IntegrityReport }>()
const emit = defineEmits<{ select: [segmentId: string] }>()
</script>
