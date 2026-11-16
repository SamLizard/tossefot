<template>
  <foreignObject
    :x="box.x - box.width / 2"
    :y="box.y - box.height / 2"
    :width="box.width"
    :height="box.height"
  >
    <div
      class="map-node"
      :class="{ 'map-node--selected': selected }"
      :style="{ '--node-color': colors.color, '--node-tint': colors.tint, '--role-color': roleColor(roleId) }"
      role="button"
      tabindex="0"
      :aria-label="ariaLabel"
      :aria-pressed="selected"
      @click="open"
      @keydown.enter.prevent="open"
      @keydown.space.prevent="open"
      @mouseenter="emit('hover', box.id, $event.currentTarget as Element)"
      @mouseleave="emit('hover', null, null)"
      @focus="emit('hover', box.id, $event.currentTarget as Element)"
      @blur="emit('hover', null, null)"
    >
      <div class="map-node__head">
        <span class="map-node__number">{{ data?.number || box.id }}</span>
        <HebrewText v-if="role(roleId)" class="map-node__role" :text="role(roleId)!.label" />
      </div>
      <HebrewText class="map-node__title" tag="div" :text="data?.title ?? ''" />
    </div>
  </foreignObject>
</template>

<script setup lang="ts">
/**
 * Nœud de la carte : petite carte HTML dans un <foreignObject>, pour que l'hébreu
 * des titres soit rendu par HebrewText (bidi correct). Bord et fond = attribution,
 * bande à gauche = rôle.
 */
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import HebrewText from '@/components/common/HebrewText.vue'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import { useTosafot } from '@/composables/useTosafot'
import { dominantAttribution, type Box } from '@/utils/argumentLayout'
import { attributionStyle } from '@/utils/argumentStyles'

const props = defineProps<{ box: Box }>()
const emit = defineEmits<{ hover: [id: string | null, el: Element | null] }>()

const { node, segment, role, roleColor, attributionLabel } = useTosafot()
const { openNode, selectedNodeId } = useSegmentPanel()

const data = computed(() => node(props.box.id))
const attribution = computed(() => (data.value ? dominantAttribution(data.value, segment) : undefined))
const theme = useTheme()
const colors = computed(() => attributionStyle(attribution.value, theme.current.value.dark))
const roleId = computed(() => data.value?.role ?? '')
const selected = computed(() => selectedNodeId.value === props.box.id)
const ariaLabel = computed(() =>
  [data.value?.number, data.value?.title, role(roleId.value)?.label, attribution.value && attributionLabel(attribution.value)]
    .filter(Boolean)
    .join(' — '),
)

function open() {
  openNode(props.box.id)
}
</script>

<style scoped>
.map-node {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px 8px 14px;
  border: 1.5px solid var(--node-color);
  border-radius: 14px;
  background:
    linear-gradient(var(--node-tint), var(--node-tint)),
    rgb(var(--v-theme-surface));
  box-shadow:
    inset 5px 0 0 var(--role-color),
    0 1px 3px rgba(0, 0, 0, 0.08);
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.15s, transform 0.15s;
}
.map-node:hover,
.map-node:focus-visible {
  outline: none;
  box-shadow:
    inset 5px 0 0 var(--role-color),
    0 0 0 3px color-mix(in srgb, var(--node-color) 35%, transparent),
    0 4px 12px rgba(0, 0, 0, 0.12);
}
.map-node--selected {
  border-width: 2.5px;
  box-shadow:
    inset 5px 0 0 var(--role-color),
    0 0 0 4px rgba(var(--v-theme-accent), 0.45);
}
.map-node__head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  line-height: 16px;
}
.map-node__number {
  font-weight: 700;
  color: var(--node-color);
}
.map-node__role {
  color: var(--role-color);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.map-node__title {
  font-size: 13.5px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
