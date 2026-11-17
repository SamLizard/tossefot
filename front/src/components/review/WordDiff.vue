<template>
  <div class="word-diff text-body-medium" :lang="hebrew ? 'he' : undefined" :dir="hebrew ? 'rtl' : undefined">
    <template v-for="(part, i) in parts" :key="i">
      <del v-if="part.removed" class="removed">{{ part.value }}</del>
      <ins v-else-if="part.added" class="added">{{ part.value }}</ins>
      <span v-else>{{ part.value }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
/** Diff mot à mot avant / après : supprimé sur fond « error », ajouté sur fond « success ». */
import { computed } from 'vue'
import { wordParts } from '@/utils/reviewDiff'

const props = withDefaults(defineProps<{ before: string; after: string; hebrew?: boolean }>(), { hebrew: false })

const parts = computed(() => wordParts(props.before, props.after))
</script>

<style scoped>
.word-diff {
  white-space: pre-wrap;
  line-height: 1.8;
}
.word-diff[lang='he'] {
  font-size: 1.15rem;
}
.removed {
  background: rgba(var(--v-theme-error), 0.18);
  color: rgb(var(--v-theme-on-surface));
  text-decoration: line-through;
  border-radius: 3px;
}
.added {
  background: rgba(var(--v-theme-success), 0.2);
  color: rgb(var(--v-theme-on-surface));
  text-decoration: none;
  border-radius: 3px;
}
</style>
