<script setup lang="ts">
/** Liste des différences mot à mot ; une ligne avec segment est cliquable. */
import type { TextDiff } from '@/utils/integrity'

defineProps<{ diffs: TextDiff[] }>()
const emit = defineEmits<{ select: [segmentId: string] }>()
</script>

<template>
  <v-list density="compact" class="py-0" bg-color="transparent">
    <v-list-item
      v-for="(diff, i) in diffs"
      :key="i"
      :disabled="!diff.segmentId"
      :append-icon="diff.segmentId ? 'mdi-arrow-right' : undefined"
      class="px-2"
      @click="diff.segmentId && emit('select', diff.segmentId)"
    >
      <template #prepend>
        <v-chip
          :color="diff.kind === 'missing' ? 'error' : 'warning'"
          size="small"
          label
          variant="tonal"
          class="me-3"
        >
          {{ diff.kind === 'missing' ? 'MANQUANT' : 'EN TROP' }}
        </v-chip>
      </template>
      <div class="text-body-medium">
        après «<bdi lang="he" dir="rtl" class="he-inline">{{ diff.context }}</bdi>» :
        <bdi lang="he" dir="rtl" class="he-inline font-weight-bold">{{ diff.words }}</bdi>
        <span v-if="diff.segmentId" class="text-medium-emphasis ms-1">({{ diff.segmentId }})</span>
      </div>
    </v-list-item>
  </v-list>
</template>
