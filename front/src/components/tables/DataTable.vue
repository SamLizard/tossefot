<template>
  <div v-if="t" dir="ltr" class="data-table">
    <div v-if="!hideTitle" class="text-title-medium mb-3">
      <HebrewText :text="t.title" />
    </div>
    <v-sheet border rounded="lg" class="overflow-hidden">
      <v-table density="comfortable">
        <thead>
          <tr>
            <th v-for="(col, i) in t.columns" :key="i" class="text-label-large font-weight-bold">
              <HebrewText :text="col" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, r) in t.rows" :key="r">
            <td
              v-for="(cell, c) in row"
              :key="c"
              :class="[verdictClass(cell), { 'font-weight-medium': c === 0 }]"
            >
              <HebrewText :text="cell" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-sheet>
    <div v-if="t.note" class="text-body-small text-medium-emphasis mt-2">
      <HebrewText :text="t.note" />
    </div>
  </div>
  <v-alert v-else type="warning" variant="tonal" density="compact">
    {{ $t('table.unknown', { id: tableId }) }}
  </v-alert>
</template>

<script setup lang="ts">
/** Table générique (docs/UI_SPEC.md §5) : LTR, cellules découpées en hébreu, חייב / פטור colorés. */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import HebrewText from '@/components/common/HebrewText.vue'

const props = withDefaults(defineProps<{ tableId: string; hideTitle?: boolean }>(), {
  hideTitle: false,
})

const { table } = useTosafot()
const t = computed(() => table(props.tableId))

function verdictClass(cell: string): string | undefined {
  const value = cell.trim()
  if (value === 'חייב') return 'cell-chayav'
  if (value === 'פטור') return 'cell-patur'
  return undefined
}
</script>

<style scoped>
.data-table th {
  background: rgb(var(--v-theme-surface-variant));
}
.cell-chayav {
  background: rgba(var(--v-theme-error), 0.12);
}
.cell-patur {
  background: rgba(var(--v-theme-success), 0.12);
}
</style>
