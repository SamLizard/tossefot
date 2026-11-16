<script setup lang="ts">
/** Table des mots d'un segment : hébreu (RTL) | français, note en petit. */
import type { Term } from '@/types/tosafot'
import HebrewText from '@/components/common/HebrewText.vue'

defineProps<{ terms: Term[] }>()
</script>

<template>
  <v-table density="compact" class="segment-terms">
    <tbody>
      <tr v-for="(term, i) in terms" :key="i">
        <td class="term-he py-2">
          <p lang="he" dir="rtl" class="he-block">{{ term.he }}</p>
        </td>
        <td class="py-2">
          <HebrewText :text="term.fr" class="text-body-medium" />
          <HebrewText
            v-if="term.note"
            :text="term.note"
            tag="div"
            class="text-body-small text-medium-emphasis mt-1"
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped>
.segment-terms {
  background: transparent;
}
.term-he {
  width: 38%;
  vertical-align: top;
}
.term-he .he-block {
  font-size: 1.15rem;
  line-height: 1.5;
}
</style>
