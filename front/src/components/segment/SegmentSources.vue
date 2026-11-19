<template>
  <div class="d-flex flex-column">
    <template v-for="(s, i) in sources" :key="s.id">
      <v-divider v-if="i" class="my-3" />
      <SourceItem :source="s" />
    </template>
  </div>
</template>
<script setup lang="ts">
/** Sources citées par un segment, chacune avec sa citation et son lien (SourceItem). */
import { computed } from 'vue'
import type { Source } from '@/types/tosafot'
import { useTosafot } from '@/composables/useTosafot'
import SourceItem from './SourceItem.vue'
const props = defineProps<{ sourceIds: string[] }>()
const { source } = useTosafot()
const sources = computed(() =>
  props.sourceIds.map((id) => source(id)).filter((s): s is Source => Boolean(s)),
)
</script>
