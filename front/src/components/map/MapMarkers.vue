<template>
  <defs>
    <marker
      v-for="type in types"
      :id="markerId(type)"
      :key="type"
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="11"
      markerHeight="11"
      markerUnits="userSpaceOnUse"
      orient="auto-start-reverse"
    >
      <path d="M1,1.2 L9,5 L1,8.8 L3,5 Z" :fill="EDGE_STYLES[type].color" />
    </marker>
  </defs>
</template>

<script setup lang="ts">
/** Pointes de flèche SVG, une par type (couleur du type). */
import { EDGE_LEGEND, EDGE_STYLES, markerId } from '@/utils/argumentStyles'

const types = EDGE_LEGEND.filter((t) => !EDGE_STYLES[t].noArrow)
</script>
