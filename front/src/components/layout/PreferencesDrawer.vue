<script setup lang="ts">
/** Préférences utilisateur (docs/UI_SPEC.md §8), gardées en localStorage. */
import { computed } from 'vue'
import { resetPreferences, usePreferences } from '@/composables/usePreferences'
import { useTosafot } from '@/composables/useTosafot'
import { VIEW_TABS } from '@/utils/views'
import LevelSelector from '@/components/common/LevelSelector.vue'

const open = defineModel<boolean>({ default: false })

const preferences = usePreferences()
const { doc } = useTosafot()

const levelIds = computed(() => doc.value.meta.levels.map((l) => l.id))
const views = VIEW_TABS.map((t) => ({ title: t.label, value: t.id, icon: t.icon }))
const PREVIEW = 'בההיא הנאה דלא קבעי'
</script>

<template>
  <v-navigation-drawer v-model="open" temporary location="end" width="340">
    <v-toolbar color="transparent" density="comfortable">
      <v-toolbar-title class="text-title-medium">Préférences</v-toolbar-title>
      <v-btn icon="mdi-close" variant="text" aria-label="Fermer" @click="open = false" />
    </v-toolbar>
    <v-divider />

    <div class="pa-4 d-flex flex-column ga-5">
      <section>
        <div class="text-label-large mb-2">Niveau par défaut</div>
        <LevelSelector v-model="preferences.level" :available="levelIds" density="compact" />
      </section>

      <v-select
        v-model="preferences.view"
        :items="views"
        label="Vue par défaut"
        variant="outlined"
        density="comfortable"
        hide-details
      />

      <section>
        <v-switch
          v-model="preferences.roleColors"
          label="Couleurs des rôles"
          color="primary"
          density="compact"
          hide-details
        />
        <v-switch
          v-model="preferences.showTranslation"
          label="Traduction visible"
          color="primary"
          density="compact"
          hide-details
        />
      </section>

      <section>
        <div class="text-label-large mb-2">Police hébraïque</div>
        <v-btn-toggle
          v-model="preferences.hebrewFont"
          mandatory
          divided
          variant="outlined"
          color="primary"
          class="w-100 font-toggle"
        >
          <v-btn value="serif" class="flex-1-1 font-btn">
            <span class="text-label-medium">Serif</span>
            <span lang="he" dir="rtl" class="preview preview-serif">{{ PREVIEW }}</span>
          </v-btn>
          <v-btn value="rashi" class="flex-1-1 font-btn">
            <span class="text-label-medium">Rashi</span>
            <span lang="he" dir="rtl" class="preview preview-rashi">{{ PREVIEW }}</span>
          </v-btn>
        </v-btn-toggle>
      </section>

      <section>
        <div class="text-label-large">Taille du texte : {{ preferences.textScale }} %</div>
        <v-slider
          v-model="preferences.textScale"
          :min="80"
          :max="160"
          :step="10"
          show-ticks="always"
          color="primary"
          hide-details
        />
      </section>

      <section>
        <div class="text-label-large mb-2">Thème</div>
        <v-btn-toggle
          v-model="preferences.theme"
          mandatory
          divided
          variant="outlined"
          color="primary"
          density="comfortable"
          class="w-100"
        >
          <v-btn value="light" prepend-icon="mdi-white-balance-sunny" class="flex-1-1">Clair</v-btn>
          <v-btn value="dark" prepend-icon="mdi-weather-night" class="flex-1-1">Sombre</v-btn>
          <v-btn value="system" prepend-icon="mdi-laptop" class="flex-1-1">Système</v-btn>
        </v-btn-toggle>
      </section>

      <v-btn variant="text" color="secondary" prepend-icon="mdi-restore" @click="resetPreferences()">
        Réinitialiser
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.font-toggle {
  height: auto !important;
}
.font-btn {
  height: auto !important;
  padding-block: 8px;
}
.font-btn :deep(.v-btn__content) {
  flex-direction: column;
  gap: 2px;
}
.preview {
  font-size: 1.1rem;
  white-space: nowrap;
}
.preview-serif {
  font-family: var(--he-font-serif);
}
.preview-rashi {
  font-family: var(--he-font-rashi);
}
</style>
