<template>
  <div v-if="available.length">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-2">
      <span class="text-label-large text-medium-emphasis">{{ $t('details.explanation') }}</span>
      <LevelSelector v-model="level" :available="available" />
    </div>
    <HebrewText :text="text" tag="p" class="text-body-large explanation" />
  </div>
</template>

<script setup lang="ts">
/** Explication d'un segment, avec son propre sélecteur de niveau (initialisé depuis les préférences). */
import { computed, ref, watch } from 'vue'
import { LEVELS, type Leveled, type LevelId } from '@/types/tosafot'
import { hasLevel, pickLevel } from '@/utils/levels'
import { usePreferences } from '@/composables/usePreferences'
import HebrewText from '@/components/common/HebrewText.vue'
import LevelSelector from '@/components/common/LevelSelector.vue'

const props = defineProps<{ explanation: Leveled }>()

const preferences = usePreferences()
const available = computed(() => LEVELS.filter((l) => hasLevel(props.explanation, l)))

/** Niveau réellement affiché : le demandé, ou le niveau inférieur non vide (comme pickLevel). */
function effective(wanted: LevelId): LevelId {
  const lower = available.value.filter((l) => LEVELS.indexOf(l) <= LEVELS.indexOf(wanted))
  return lower[lower.length - 1] ?? available.value[0] ?? wanted
}

const level = ref<LevelId>(effective(preferences.level))
// Un changement du niveau global s'applique aussi aux blocs déjà affichés.
watch(
  () => preferences.level,
  (value) => (level.value = effective(value)),
)
const text = computed(() => pickLevel(props.explanation, level.value))
</script>

<style scoped>
.explanation {
  line-height: 1.7;
}
</style>
