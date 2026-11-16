<script setup lang="ts">
/** Panneau latéral (à droite) : segment ou nœud sélectionné (docs/UI_SPEC.md §3.2, §3.3). */
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useTosafot } from '@/composables/useTosafot'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import HebrewText from '@/components/common/HebrewText.vue'
import RoleChip from '@/components/common/RoleChip.vue'
import SegmentHeader from '@/components/segment/SegmentHeader.vue'
import TosafotHebrew from '@/components/segment/TosafotHebrew.vue'
import SegmentDetails from '@/components/segment/SegmentDetails.vue'
import NodeDetails from '@/components/segment/NodeDetails.vue'

const { node } = useTosafot()
const { selectedSegmentId, selectedNodeId, closePanel } = useSegmentPanel()
const { mdAndUp, xs } = useDisplay()

const open = computed({
  get: () => Boolean(selectedSegmentId.value || selectedNodeId.value),
  set: (value) => {
    if (!value) closePanel()
  },
})
const selectedNode = computed(() => (selectedNodeId.value ? node(selectedNodeId.value) : undefined))
</script>

<template>
  <v-navigation-drawer
    v-model="open"
    location="end"
    :width="xs ? 360 : 480"
    :temporary="!mdAndUp"
    color="surface"
    class="segment-panel"
  >
    <div class="d-flex align-center ga-2 px-5 pt-4 pb-2">
      <span class="text-title-medium text-medium-emphasis flex-grow-1">
        {{ selectedSegmentId ? 'Segment' : 'Section' }}
      </span>
      <v-btn icon="mdi-close" variant="text" size="small" aria-label="Fermer le panneau" @click="closePanel" />
    </div>
    <v-divider />

    <div v-if="selectedSegmentId" :key="selectedSegmentId" class="d-flex flex-column ga-4 pa-5">
      <SegmentHeader :segment-id="selectedSegmentId" />
      <TosafotHebrew :segment-id="selectedSegmentId" class="panel-he" />
      <v-divider />
      <SegmentDetails :segment-id="selectedSegmentId" />
    </div>

    <div v-else-if="selectedNode" :key="selectedNode.id" class="d-flex flex-column ga-4 pa-5">
      <div class="d-flex align-start ga-3">
        <span class="text-headline-small text-primary font-weight-bold">{{ selectedNode.number }}</span>
        <div class="flex-grow-1 d-flex flex-column ga-2">
          <HebrewText :text="selectedNode.title" class="text-title-large" />
          <div><RoleChip :role="selectedNode.role" /></div>
        </div>
      </div>
      <NodeDetails :node-id="selectedNode.id" />
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.panel-he {
  font-size: 1.45rem;
  line-height: 2;
}
</style>
