<template>
  <div
    v-if="current"
    class="node-header d-flex align-center ga-3"
    role="button"
    tabindex="0"
    :aria-expanded="open"
    @click="emit('toggle')"
    @keydown.enter.prevent="emit('toggle')"
    @keydown.space.prevent="emit('toggle')"
  >
    <v-icon
      :icon="open ? 'mdi-chevron-down' : 'mdi-chevron-right'"
      size="small"
      class="text-medium-emphasis"
    />
    <span
      class="node-number font-weight-bold"
      :class="depth === 0 ? 'text-title-large' : 'text-title-small'"
      :style="{ color }"
    >{{ current.number }}</span>
    <HebrewText
      :text="current.title"
      class="flex-grow-1"
      :class="depth === 0 ? 'text-title-medium font-weight-medium' : 'text-body-large'"
    />
    <RoleChip :role="current.role" size="small" />
    <v-btn
      icon="mdi-information-outline"
      variant="text"
      size="x-small"
      density="comfortable"
      class="text-medium-emphasis"
      :aria-label="$t('structure.openNode')"
      @click.stop="emit('info')"
      @keydown.enter.stop
      @keydown.space.stop
    />
  </div>
</template>

<script setup lang="ts">
/** En-tête cliquable d'un nœud : chevron, numéro, titre, rôle, bouton « ⓘ ». */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import HebrewText from '@/components/common/HebrewText.vue'
import RoleChip from '@/components/common/RoleChip.vue'

const props = defineProps<{ nodeId: string; open: boolean; depth: number }>()
const emit = defineEmits<{ toggle: []; info: [] }>()

const { node, roleColor } = useTosafot()
const current = computed(() => node(props.nodeId))
const color = computed(() => roleColor(current.value?.role ?? ''))
</script>

<style scoped>
.node-header {
  cursor: pointer;
  border-radius: 8px;
  padding: 4px 6px;
  transition: background-color 0.15s;
}
.node-header:hover,
.node-header:focus-visible {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  outline: none;
}
.node-number {
  min-width: 1.6em;
  text-align: center;
}
</style>
