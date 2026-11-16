<script setup lang="ts">
/** Fenêtre modale de la table ouverte (`openTableId` de useSegmentPanel). */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import HebrewText from '@/components/common/HebrewText.vue'
import DataTable from '@/components/tables/DataTable.vue'

const { table } = useTosafot()
const { openTableId, closeTable } = useSegmentPanel()

const open = computed({
  get: () => openTableId.value !== null,
  set: (value) => {
    if (!value) closeTable()
  },
})
const title = computed(() => (openTableId.value ? (table(openTableId.value)?.title ?? '') : ''))
</script>

<template>
  <v-dialog v-model="open" max-width="760" scrollable>
    <v-card v-if="openTableId" variant="flat">
      <v-card-title class="d-flex align-center ga-2 pt-4 px-6">
        <v-icon icon="mdi-table" color="secondary" size="small" />
        <HebrewText :text="title" class="flex-grow-1 text-title-large" />
        <v-btn icon="mdi-close" variant="text" size="small" aria-label="Fermer la table" @click="closeTable" />
      </v-card-title>
      <v-card-text class="px-6 pb-6">
        <DataTable :table-id="openTableId" hide-title />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
