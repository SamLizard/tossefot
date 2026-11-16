<script setup lang="ts">
/** Infobulle d'un terme expliqué (`segment.terms`) : hébreu → français, note, abréviations contenues. */
import type { Term } from '@/types/tosafot'
import type { AbbrInTerm } from '@/utils/segmentTokens'
import HebrewText from '@/components/common/HebrewText.vue'

defineProps<{ term: Term; abbrs?: AbbrInTerm[] }>()
</script>

<template>
  <v-tooltip>
    <template #activator="{ props: tip }">
      <span v-bind="tip" class="he-term" tabindex="0"><slot /></span>
    </template>
    <div>
      <bdi lang="he" dir="rtl" class="he-inline font-weight-bold">{{ term.he }}</bdi> →
      <HebrewText :text="term.fr" />
    </div>
    <div v-if="term.note" class="text-body-small mt-1 opacity-80">
      <HebrewText :text="term.note" />
    </div>
    <div v-for="a in abbrs" :key="a.word" class="text-body-small mt-1">
      <bdi lang="he" dir="rtl" class="he-inline">{{ a.word }}</bdi> =
      <bdi lang="he" dir="rtl" class="he-inline">{{ a.full }}</bdi>
      <HebrewText v-if="a.warning" :text="` (${a.warning})`" />
    </div>
  </v-tooltip>
</template>
