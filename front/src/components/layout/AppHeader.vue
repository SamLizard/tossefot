<script setup lang="ts">
/** Barre d'application : titre hébreu, niveau global, « Les 4 שומרים », vérification, menu. */
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import HebrewText from '@/components/common/HebrewText.vue'
import LevelSelector from '@/components/common/LevelSelector.vue'
import TextIntegrityCheck from '@/components/integrity/TextIntegrityCheck.vue'
import AppMenu from './AppMenu.vue'

const emit = defineEmits<{ 'open-preferences': [] }>()

const { doc, table } = useTosafot()
const preferences = usePreferences()
const { openTable } = useSegmentPanel()
const { smAndDown } = useDisplay()

const meta = computed(() => doc.value.meta)
const subtitle = computed(() => [meta.value.masechet, meta.value.daf, meta.value.perek].join(' · '))
const levelIds = computed(() => meta.value.levels.map((l) => l.id))
const hasShomrim = computed(() => Boolean(table('t-shomrim')))
</script>

<template>
  <!-- Fond « surface » : le LevelSelector (couleur primary) reste lisible. -->
  <v-app-bar color="surface" flat :height="smAndDown ? 64 : 76" class="app-header">
    <v-app-bar-title class="ms-2">
      <div class="d-flex flex-column title-block">
        <HebrewText :text="meta.title" tag="div" class="header-title text-truncate" />
        <HebrewText :text="subtitle" tag="div" class="text-label-medium header-subtitle text-truncate" />
      </div>
    </v-app-bar-title>

    <template #append>
      <div class="d-flex align-center ga-2 me-2">
        <template v-if="!smAndDown">
          <LevelSelector v-model="preferences.level" :available="levelIds" density="compact" />
          <v-btn
            v-if="hasShomrim"
            variant="tonal"
            color="secondary"
            prepend-icon="mdi-shield-account-outline"
            @click="openTable('t-shomrim')"
          >
            Les 4 <bdi lang="he" dir="rtl" class="he-inline ms-1">שומרים</bdi>
          </v-btn>
        </template>
        <TextIntegrityCheck :compact="smAndDown" />
        <AppMenu
          :compact="smAndDown"
          :has-shomrim="hasShomrim"
          @open-preferences="emit('open-preferences')"
        />
      </div>
    </template>
  </v-app-bar>
</template>

<style scoped>
.title-block {
  line-height: 1.25;
  min-width: 0;
}
.app-header {
  border-bottom: 2px solid rgb(var(--v-theme-secondary));
}
.header-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}
.header-title :deep(.he-inline) {
  font-size: 1em;
}
.header-subtitle {
  color: rgb(var(--v-theme-secondary));
}
</style>
