<template>
  <!-- Déjà dans le v-container de 960 px de TosafotReader. -->
  <div class="continuous-text">
    <TextToolbar />

    <v-card variant="flat" class="pa-5 pa-sm-8">
      <p class="text-label-medium text-medium-emphasis mb-4">
        {{ $t('text.hint') }}
      </p>
      <div lang="he" dir="rtl" class="he-block he-tosafot tosafot-text">
        <template v-for="s in doc.segments" :key="s.id">
          <NodeMarker v-for="id in markers.get(s.id) ?? []" :key="id" :node-id="id" />
          <TextSegment :segment-id="s.id" />{{ ' ' }}
        </template>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
/**
 * Vue « Texte continu » (docs/UI_SPEC.md §3.2) : le תוספות entier en RTL,
 * un <span> par segment, repères des nœuds au début de chacun.
 */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { nodeStartMarkers } from '@/utils/structure'
import NodeMarker from './NodeMarker.vue'
import TextSegment from './TextSegment.vue'
import TextToolbar from './TextToolbar.vue'

const { doc, nodes } = useTosafot()

const markers = computed(() => nodeStartMarkers(nodes.value))
</script>

<style scoped>
.tosafot-text {
  font-size: 1.45rem;
  line-height: 2.1;
  text-align: justify;
}
</style>
