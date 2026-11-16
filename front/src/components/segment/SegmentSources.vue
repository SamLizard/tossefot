<script setup lang="ts">
/** Sources citées par un segment : `ref` en hébreu, lien Sefaria du JSON, `role` en sous-titre. */
import { computed } from 'vue'
import type { Source } from '@/types/tosafot'
import { useTosafot } from '@/composables/useTosafot'
import HebrewText from '@/components/common/HebrewText.vue'

const props = defineProps<{ sourceIds: string[] }>()

const { source } = useTosafot()
const sources = computed(() =>
  props.sourceIds.map((id) => source(id)).filter((s): s is Source => Boolean(s)),
)
</script>

<template>
  <v-list density="compact" bg-color="transparent" class="py-0">
    <v-list-item
      v-for="s in sources"
      :key="s.id"
      :href="s.url"
      target="_blank"
      rel="noopener"
      rounded="lg"
      append-icon="mdi-open-in-new"
    >
      <v-list-item-title>
        <bdi lang="he" dir="rtl" class="he-inline">{{ s.ref }}</bdi>
      </v-list-item-title>
      <v-list-item-subtitle v-if="s.role" class="text-wrap">
        <HebrewText :text="s.role" />
      </v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>
