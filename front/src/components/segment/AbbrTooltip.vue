<template>
  <v-tooltip>
    <template #activator="{ props: tip }">
      <span v-bind="tip" class="he-abbr" tabindex="0"><slot /></span>
    </template>
    <bdi lang="he" dir="rtl" class="he-inline">{{ full }}</bdi>
    <div v-if="warning" class="d-flex ga-1 mt-1 text-body-small">
      <v-icon icon="mdi-alert-outline" size="x-small" class="mt-1" />
      <HebrewText :text="warning" />
    </div>
  </v-tooltip>
</template>

<script setup lang="ts">
/** Infobulle d'une abréviation : forme complète et avertissement éventuel (docs/UI_SPEC.md §6). */
import HebrewText from '@/components/common/HebrewText.vue'

defineProps<{ full: string; warning?: string }>()
</script>
