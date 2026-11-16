<template>
  <v-sheet class="map-toolbar d-flex align-center ga-1 pa-1" rounded="lg" elevation="2" border>
    <v-btn icon="mdi-minus" size="small" variant="text" :aria-label="$t('map.zoomOut')" @click="emit('zoom-out')" />
    <span class="text-label-medium text-medium-emphasis text-center zoom-value" aria-live="polite">
      {{ Math.round(scale * 100) }} %
    </span>
    <v-btn icon="mdi-plus" size="small" variant="text" :aria-label="$t('map.zoomIn')" @click="emit('zoom-in')" />
    <v-divider vertical class="mx-1" />
    <v-btn
      prepend-icon="mdi-fit-to-page-outline"
      size="small"
      variant="text"
      :aria-label="$t('map.fitAria')"
      @click="emit('fit')"
    >
      {{ $t('map.fit') }}
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
/** Boutons de zoom flottants de la carte. */
defineProps<{ scale: number }>()
const emit = defineEmits<{ 'zoom-in': []; 'zoom-out': []; fit: [] }>()
</script>

<style scoped>
.map-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}
.zoom-value {
  min-width: 44px;
}
</style>
