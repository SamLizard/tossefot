<script setup lang="ts">
/** Badge du rôle d'un segment ou d'un nœud, couleur de `meta.roles`. */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import HebrewText from '@/components/common/HebrewText.vue'

const props = withDefaults(
  defineProps<{ role: string; size?: 'x-small' | 'small' | 'default' | 'large' }>(),
  { size: 'small' },
)

const { role: findRole, roleColor } = useTosafot()

const label = computed(() => findRole(props.role)?.label ?? props.role)
const color = computed(() => roleColor(props.role))
</script>

<template>
  <v-chip :color="color" :size="size" variant="tonal" label class="font-weight-medium">
    <HebrewText :text="label" />
  </v-chip>
</template>
