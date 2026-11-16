<script setup lang="ts">
/**
 * Texte mixte français / hébreu (docs/UI_SPEC.md §2).
 * Chaque suite hébraïque est enveloppée dans <bdi lang="he">.
 * Ne jamais utiliser dir="auto" sur un paragraphe mixte.
 */
import { computed } from 'vue'
import { splitHebrew } from '@/utils/hebrew'

const props = withDefaults(defineProps<{ text: string; tag?: string }>(), { tag: 'span' })

const parts = computed(() => splitHebrew(props.text))
</script>

<template>
  <component :is="tag">
    <template v-for="(part, i) in parts" :key="i">
      <bdi v-if="part.he" lang="he" dir="rtl" class="he-inline">{{ part.text }}</bdi>
      <template v-else>{{ part.text }}</template>
    </template>
  </component>
</template>
