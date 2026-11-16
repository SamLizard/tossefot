<script setup lang="ts">
/** Barre au-dessus du texte continu : couleurs des rôles on/off et légende. */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { usedRoles } from '@/utils/structure'
import RoleChip from '@/components/common/RoleChip.vue'

const { doc } = useTosafot()
const preferences = usePreferences()

const legend = computed(() =>
  usedRoles(
    doc.value.meta.roles.map((r) => r.id),
    doc.value.segments,
  ),
)
</script>

<template>
  <div class="d-flex flex-wrap align-center ga-3 mb-3">
    <v-switch
      v-model="preferences.roleColors"
      label="Couleurs des rôles"
      color="primary"
      density="compact"
      hide-details
      inset
      class="flex-grow-0"
    />
    <v-expand-transition>
      <div v-if="preferences.roleColors" class="d-flex flex-wrap ga-1" aria-label="Légende des rôles">
        <RoleChip v-for="id in legend" :key="id" :role="id" size="x-small" />
      </div>
    </v-expand-transition>
  </div>
</template>
