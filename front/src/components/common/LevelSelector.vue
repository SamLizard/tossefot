<template>
  <v-btn-toggle
    v-model="model"
    mandatory
    divided
    variant="outlined"
    color="primary"
    :density="density"
    :aria-label="t('levels.label')"
  >
    <v-tooltip v-for="item in items" :key="item.id" :disabled="!item.description">
      <template #activator="{ props: tip }">
        <v-btn v-bind="tip" :value="item.id" :disabled="item.disabled" size="small">
          {{ item.label }}
        </v-btn>
      </template>
      <HebrewText :text="item.description" />
    </v-tooltip>
  </v-btn-toggle>
</template>

<script setup lang="ts">
/** Choix du niveau d'explication : Essentiel / Standard / Approfondi (docs/UI_SPEC.md §1). */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LEVELS, type LevelId } from '@/types/tosafot'
import { useTosafot } from '@/composables/useTosafot'
import HebrewText from '@/components/common/HebrewText.vue'

const props = withDefaults(
  defineProps<{ available?: LevelId[]; density?: 'default' | 'comfortable' | 'compact' }>(),
  { available: undefined, density: 'compact' },
)
const model = defineModel<LevelId>({ required: true })

const { doc } = useTosafot()
const { t } = useI18n()

const items = computed(() =>
  LEVELS.map((id) => {
    const def = doc.value.meta.levels.find((l) => l.id === id)
    return {
      id,
      label: def?.label ?? t(`levels.${id}`),
      description: def?.description ?? '',
      disabled: props.available ? !props.available.includes(id) : false,
    }
  }),
)
</script>
