<template>
  <v-tooltip
    :model-value="Boolean(edge && point)"
    :target="point ?? undefined"
    location="top"
    :open-on-hover="false"
    :open-on-focus="false"
    :max-width="360"
  >
    <template v-if="edge">
      <div class="text-label-large mb-1">
        {{ $t('map.edgeExplanation', { from: edge.from, to: edge.to, type: typeLabel }) }}
      </div>
      <HebrewText tag="div" class="text-body-small map-edge-tooltip__text" :text="edge.explanation ?? ''" />
    </template>
  </v-tooltip>
</template>
<script setup lang="ts">
/** Infobulle d'une flèche survolée : pourquoi elle existe (`edge.explanation` du JSON), au curseur. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HebrewText from '@/components/common/HebrewText.vue'
import type { LayoutEdge } from '@/utils/argumentLayout'
import { EDGE_STYLES } from '@/utils/argumentStyles'
const props = defineProps<{ edge: LayoutEdge | null; point: [x: number, y: number] | null }>()
const { t } = useI18n()
const typeLabel = computed(() => (props.edge ? t(EDGE_STYLES[props.edge.type].labelKey).toLowerCase() : ''))
</script>
<style scoped>
.map-edge-tooltip__text {
  line-height: 1.5;
}
</style>
