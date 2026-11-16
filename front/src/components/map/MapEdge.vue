<template>
  <g class="map-edge" :aria-label="$t(style.labelKey)">
    <path
      :d="edge.path"
      fill="none"
      :stroke="style.color"
      :stroke-width="style.width"
      :stroke-dasharray="style.dash"
      stroke-linecap="round"
      stroke-linejoin="round"
      :marker-end="marker"
    />
    <g v-if="style.cross" :transform="crossTransform">
      <circle r="8" class="map-edge__halo" />
      <path d="M-5,-5 L5,5 M-5,5 L5,-5" :stroke="style.color" stroke-width="2.25" stroke-linecap="round" />
    </g>
    <foreignObject
      v-if="edge.label && edge.labelPos"
      :x="edge.labelPos.x - LABEL_WIDTH / 2"
      :y="edge.labelPos.y - LABEL_HEIGHT / 2"
      :width="LABEL_WIDTH"
      :height="LABEL_HEIGHT"
    >
      <div class="map-edge__label" :style="{ borderColor: style.color }">
        <HebrewText :text="edge.label" />
      </div>
    </foreignObject>
  </g>
</template>

<script setup lang="ts">
/** Une flèche de la carte : chemin, pointe, croix (« rejette ») et étiquette. */
import { computed } from 'vue'
import HebrewText from '@/components/common/HebrewText.vue'
import { LABEL_HEIGHT, LABEL_WIDTH, type LayoutEdge } from '@/utils/argumentLayout'
import { EDGE_STYLES, markerId } from '@/utils/argumentStyles'

const props = defineProps<{ edge: LayoutEdge }>()

const style = computed(() => EDGE_STYLES[props.edge.type])
const marker = computed(() => (style.value.noArrow ? undefined : `url(#${markerId(props.edge.type)})`))
const crossTransform = computed(
  () => `translate(${props.edge.mid.x} ${props.edge.mid.y}) rotate(${props.edge.angle})`,
)
</script>

<style scoped>
.map-edge__halo {
  fill: rgb(var(--v-theme-surface));
}
.map-edge__label {
  box-sizing: border-box;
  height: 100%;
  padding: 0 8px;
  border: 1px dashed;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  color: rgba(var(--v-theme-on-surface), 0.75);
  font-size: 12px;
  font-style: italic;
  line-height: 22px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
