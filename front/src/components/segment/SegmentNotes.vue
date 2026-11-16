<script setup lang="ts">
/** Notes textuelles sur l'édition (renvois faux, doublons…), fond jaune pâle. */
import HebrewText from '@/components/common/HebrewText.vue'

defineProps<{ notes: string[] }>()
</script>

<template>
  <div class="d-flex flex-column ga-2">
    <v-sheet
      v-for="(note, i) in notes"
      :key="i"
      color="note-bg"
      rounded="lg"
      class="d-flex ga-3 pa-3 text-body-medium"
    >
      <v-icon icon="mdi-alert" color="warning" size="small" class="mt-1" />
      <HebrewText :text="note" />
    </v-sheet>
  </div>
</template>
