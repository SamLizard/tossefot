<script setup lang="ts">
/** Repère discret (I, II.A…) au début d'un nœud dans le texte continu. */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { useSegmentPanel } from '@/composables/useSegmentPanel'

const props = defineProps<{ nodeId: string }>()

const { node, roleColor } = useTosafot()
const { openNode } = useSegmentPanel()
const color = computed(() => roleColor(node(props.nodeId)?.role ?? ''))
</script>

<template>
  <!-- bdi + dir="ltr" : « II.A » ne doit pas être retourné dans le bloc RTL. -->
  <bdi dir="ltr" class="node-marker">
    <v-chip
      :color="color"
      size="x-small"
      variant="tonal"
      label
      :aria-label="`Ouvrir le nœud ${nodeId}`"
      @click.stop="openNode(nodeId)"
    >
      {{ nodeId }}
    </v-chip>
  </bdi>
</template>

<style scoped>
.node-marker {
  display: inline-block;
  vertical-align: super;
  line-height: 1;
  margin-inline: 0.15em;
  font-family: Roboto, sans-serif;
}
.node-marker :deep(.v-chip) {
  font-size: 0.65rem;
  height: 1.3rem;
  padding-inline: 0.35rem;
}
</style>
