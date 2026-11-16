<template>
  <v-sheet class="map-legend d-flex flex-wrap align-center ga-2 px-4 py-2" border="t" color="surface">
    <span class="text-label-medium text-medium-emphasis mr-1">{{ $t('map.arrows') }}</span>
    <v-chip v-for="type in EDGE_LEGEND" :key="type" size="small" variant="outlined">
      <svg width="34" height="10" class="mr-2" aria-hidden="true">
        <line
          x1="2"
          y1="5"
          x2="32"
          y2="5"
          :stroke="EDGE_STYLES[type].color"
          :stroke-width="EDGE_STYLES[type].width + 0.5"
          :stroke-dasharray="EDGE_STYLES[type].dash"
          stroke-linecap="round"
        />
        <path v-if="EDGE_STYLES[type].cross" d="M14,1 L20,9 M14,9 L20,1" :stroke="EDGE_STYLES[type].color" stroke-width="2" />
      </svg>
      {{ $t(EDGE_STYLES[type].labelKey) }}
    </v-chip>
    <v-divider vertical class="mx-2" />
    <span class="text-label-medium text-medium-emphasis mr-1">{{ $t('map.attribution') }}</span>
    <v-chip
      v-for="a in doc.meta.attributions"
      :key="a.id"
      size="small"
      variant="outlined"
      :style="{ borderColor: attributionStyle(a.id).color, background: attributionStyle(a.id).tint }"
    >
      <HebrewText :text="a.label" />
    </v-chip>
    <span class="text-label-small text-medium-emphasis ml-auto">
      {{ $t('map.hint') }}
    </span>
  </v-sheet>
</template>

<script setup lang="ts">
/** Légende fixe en bas de la carte : types de flèches et attributions. */
import HebrewText from '@/components/common/HebrewText.vue'
import { useTosafot } from '@/composables/useTosafot'
import { attributionStyle, EDGE_LEGEND, EDGE_STYLES } from '@/utils/argumentStyles'

const { doc } = useTosafot()
</script>

<style scoped>
.map-legend {
  flex: 0 0 auto;
}
</style>
