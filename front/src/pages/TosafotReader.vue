<template>
  <AppHeader @open-preferences="preferencesOpen = true" />

  <v-app-bar density="compact" flat color="surface" class="tabs-bar">
    <ViewTabs v-model="tab" />
  </v-app-bar>

  <v-main>
    <v-container class="reading-width py-6">
      <ContextView v-if="currentView === 'context'" />
      <StructureTree v-else-if="currentView === 'structure'" />
      <ContinuousText v-else-if="currentView === 'text'" />
      <SynthesisView v-else-if="currentView === 'synthesis'" />
      <GlossaryView v-else-if="currentView === 'glossary'" />
      <PreparationNotes v-else-if="currentView === 'notes'" />
      <template v-else-if="currentView === 'review'">
        <ReviewPage v-if="preferences.reviewMode" />
        <v-alert v-else type="info" variant="tonal" :text="$t('reviewing.modeOff')">
          <template #append>
            <v-btn variant="text" @click="preferences.reviewMode = true">{{ $t('reviewing.enable') }}</v-btn>
          </template>
        </v-alert>
      </template>
    </v-container>
    <!-- La carte a besoin de plus de largeur que le texte. -->
    <v-container v-if="currentView === 'map'" fluid class="py-6">
      <ArgumentMap />
    </v-container>
  </v-main>

  <SegmentPanel />
  <TableDialog />
  <PreferencesDrawer v-model="preferencesOpen" />
  <CommentDialog v-if="preferences.reviewMode" />
</template>

<script setup lang="ts">
/**
 * Page de lecture d'un תוספות déjà chargé : fournit le document aux enfants
 * (provideTosafot doit être appelé de façon synchrone dans setup).
 */
import { computed, onBeforeUnmount, ref, toRef } from 'vue'
import { provideTosafot } from '@/composables/useTosafot'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import { useViewNavigation } from '@/composables/useViewNavigation'
import { usePreferences, type ViewId } from '@/composables/usePreferences'
import type { TosafotDoc } from '@/types/tosafot'
import { isMainView } from '@/utils/views'
import AppHeader from '@/components/layout/AppHeader.vue'
import ViewTabs from '@/components/layout/ViewTabs.vue'
import PreferencesDrawer from '@/components/layout/PreferencesDrawer.vue'
import SegmentPanel from '@/components/segment/SegmentPanel.vue'
import TableDialog from '@/components/tables/TableDialog.vue'
import ContextView from '@/components/views/ContextView.vue'
import StructureTree from '@/components/structure/StructureTree.vue'
import ContinuousText from '@/components/text/ContinuousText.vue'
import ArgumentMap from '@/components/map/ArgumentMap.vue'
import SynthesisView from '@/components/views/SynthesisView.vue'
import GlossaryView from '@/components/views/GlossaryView.vue'
import PreparationNotes from '@/components/views/PreparationNotes.vue'
import ReviewPage from '@/components/review/ReviewPage.vue'
import CommentDialog from '@/components/review/CommentDialog.vue'

// La vue courante est lue dans la route (useViewNavigation), pas en prop.
const props = defineProps<{ doc: TosafotDoc }>()

provideTosafot(toRef(props, 'doc'))

const { currentView, goTo } = useViewNavigation()
const panel = useSegmentPanel()
const preferences = usePreferences()
const preferencesOpen = ref(false)

const tab = computed<ViewId | undefined>({
  get: () => (isMainView(currentView.value) ? currentView.value : undefined),
  set: (view) => {
    if (view) void goTo(view)
  },
})

// L'état du panneau est global : on le vide en quittant la page.
onBeforeUnmount(() => {
  panel.closePanel()
  panel.closeTable()
  panel.highlightedSegmentId.value = null
})
</script>

<style scoped>
.reading-width {
  max-width: 960px;
}
.tabs-bar {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
