<script setup lang="ts">
/** Boutons de zoom flottants de la carte. */
defineProps<{ scale: number }>()
const emit = defineEmits<{ 'zoom-in': []; 'zoom-out': []; fit: [] }>()
</script>

<template>
  <v-sheet class="map-toolbar d-flex align-center ga-1 pa-1" rounded="lg" elevation="2" border>
    <v-btn icon="mdi-minus" size="small" variant="text" aria-label="Zoom arrière" @click="emit('zoom-out')" />
    <span class="text-label-medium text-medium-emphasis text-center zoom-value" aria-live="polite">
      {{ Math.round(scale * 100) }} %
    </span>
    <v-btn icon="mdi-plus" size="small" variant="text" aria-label="Zoom avant" @click="emit('zoom-in')" />
    <v-divider vertical class="mx-1" />
    <v-btn
      prepend-icon="mdi-fit-to-page-outline"
      size="small"
      variant="text"
      aria-label="Ajuster à la largeur"
      @click="emit('fit')"
    >
      Ajuster
    </v-btn>
  </v-sheet>
</template>

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
