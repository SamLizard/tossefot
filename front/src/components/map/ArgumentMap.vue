<template>
  <div class="argument-map d-flex flex-column bg-surface">
    <div
      ref="viewport"
      class="argument-map__viewport"
      :class="{ 'argument-map__viewport--dragging': dragging }"
      v-on="handlers"
      @click.capture="onClickCapture"
    >
      <MapToolbar :scale="scale" @zoom-in="zoomIn" @zoom-out="zoomOut" @fit="fit" />
      <!-- Transformation CSS sur un calque HTML : voir usePanZoom (traces sous Safari). -->
      <div
        class="argument-map__layer"
        :class="{ 'argument-map__layer--moving': moving }"
        :style="{ transform }"
      >
      <svg
        class="argument-map__svg"
        role="group"
        :aria-label="$t('map.ariaLabel')"
        :width="graph.width"
        :height="graph.height"
      >
        <MapMarkers />
        <g>
          <rect
            v-for="s in graph.sections"
            :key="s.id"
            class="argument-map__section"
            :x="s.x - s.width / 2"
            :y="s.y - s.height / 2"
            :width="s.width"
            :height="s.height"
            rx="20"
          />
          <text
            v-for="s in graph.sections"
            :key="`t-${s.id}`"
            class="argument-map__section-label"
            :x="s.x - s.width / 2 + 16"
            :y="s.y - s.height / 2 - 10"
          >
            {{ s.id }}
          </text>
          <MapEdge v-for="e in graph.edges" :key="e.id" :edge="e" @hover="onEdgeHover" />
          <MapNode v-for="b in graph.nodes" :key="b.id" :box="b" @hover="onHover" />
        </g>
      </svg>
      </div>
      <MapTooltip :node-id="hoveredId" :target="hoveredEl" />
      <MapEdgeTooltip :edge="hoveredEdge" :point="edgePoint" />
    </div>
    <MapLegend />
  </div>
</template>

<script setup lang="ts">
/**
 * Vue « Carte d'arguments » (docs/UI_SPEC.md §3.3) : graphe dagre dessiné en SVG,
 * zoom et déplacement, légende fixe. Clic sur un nœud → panneau latéral.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePanZoom } from '@/composables/usePanZoom'
import { useTosafot } from '@/composables/useTosafot'
import { layoutArguments, type LayoutEdge } from '@/utils/argumentLayout'
import MapEdge from './MapEdge.vue'
import MapEdgeTooltip from './MapEdgeTooltip.vue'
import MapLegend from './MapLegend.vue'
import MapMarkers from './MapMarkers.vue'
import MapNode from './MapNode.vue'
import MapToolbar from './MapToolbar.vue'
import MapTooltip from './MapTooltip.vue'

const { doc, nodes } = useTosafot()

const graph = computed(() => layoutArguments(doc.value, nodes.value))

const viewport = ref<HTMLElement | null>(null)
const { scale, transform, moving, dragging, zoomIn, zoomOut, fit, handlers, onClickCapture } = usePanZoom(
  viewport,
  () => graph.value,
)

const hoveredId = ref<string | null>(null)
const hoveredEl = ref<Element | null>(null)
function onHover(id: string | null, el: Element | null) {
  hoveredId.value = dragging.value ? null : id
  hoveredEl.value = dragging.value ? null : el
}
// Flèche survolée : pas d'infobulle pendant un glissement.
const hoveredEdge = ref<LayoutEdge | null>(null)
const edgePoint = ref<[x: number, y: number] | null>(null)
function onEdgeHover(edge: LayoutEdge | null, point: [x: number, y: number] | null) {
  hoveredEdge.value = dragging.value ? null : edge
  edgePoint.value = dragging.value ? null : point
}
watch(dragging, (d) => d && onEdgeHover(null, null))

// « Ajuster » au premier affichage, puis à chaque changement de document.
let fitted = false
const resize = new ResizeObserver(() => {
  if (!fitted) fitted = fit()
})
onMounted(() => viewport.value && resize.observe(viewport.value))
onBeforeUnmount(() => resize.disconnect())
watch(graph, () => nextTick(fit))
</script>

<style scoped>
.argument-map {
  width: 100%;
  /* --v-layout-top : hauteur des barres posées par v-app (en-tête, onglets). */
  height: calc(100dvh - var(--v-layout-top, 112px));
  min-height: 360px;
}
.argument-map__viewport {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.argument-map__viewport--dragging {
  cursor: grabbing;
}
.argument-map__layer {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}
.argument-map__layer--moving {
  will-change: transform;
}
.argument-map__svg {
  display: block;
  overflow: visible;
}
.argument-map__section {
  fill: rgba(var(--v-theme-surface-variant), 0.45);
  stroke: rgba(var(--v-theme-on-surface), 0.06);
}
.argument-map__section-label {
  fill: rgba(var(--v-theme-on-surface), 0.35);
  font-size: 22px;
  font-weight: 700;
}
</style>
