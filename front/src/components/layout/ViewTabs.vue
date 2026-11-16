<script setup lang="ts">
/** Onglets des vues principales ; la vue recommandée par le JSON porte un badge. */
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useTosafot } from '@/composables/useTosafot'
import type { ViewId } from '@/composables/usePreferences'
import { VIEW_TABS, recommendedView } from '@/utils/views'

// undefined quand la page affichée n'est pas un onglet (glossaire, notes).
const model = defineModel<ViewId | undefined>()

const { doc } = useTosafot()
const { xs } = useDisplay()
const recommended = computed(() => recommendedView(doc.value.visualSummary?.recommended))
</script>

<template>
  <v-tabs
    v-model="model"
    :mandatory="false"
    color="primary"
    :align-tabs="xs ? 'start' : 'center'"
    show-arrows
    class="w-100"
    density="compact"
  >
    <v-tab v-for="tab in VIEW_TABS" :key="tab.id" :value="tab.id" :aria-label="xs ? tab.label : undefined">
      <v-icon :icon="tab.icon" :start="!xs" />
      <span v-if="!xs">{{ tab.label }}</span>
      <v-tooltip v-if="tab.id === recommended" :text="doc.visualSummary.why" location="bottom">
        <template #activator="{ props: activator }">
          <v-chip
            v-bind="activator"
            size="x-small"
            color="secondary"
            variant="tonal"
            class="ms-2"
            label
          >
            recommandé
          </v-chip>
        </template>
      </v-tooltip>
    </v-tab>
  </v-tabs>
</template>
