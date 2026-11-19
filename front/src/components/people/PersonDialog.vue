<template>
  <v-dialog v-model="open" max-width="640" scrollable>
    <PersonCard v-if="openPersonId" :key="openPersonId" :person-id="openPersonId" class="person-dialog">
      <template #actions>
        <v-btn icon="mdi-close" variant="text" size="small" :aria-label="$t('people.close')" @click="closePerson" />
      </template>
    </PersonCard>
  </v-dialog>
</template>

<script setup lang="ts">
/** Fenêtre modale de la fiche ouverte (`openPersonId` de usePersonDialog). */
import { computed } from 'vue'
import { usePersonDialog } from '@/composables/usePersonDialog'
import PersonCard from '@/components/common/PersonCard.vue'

const { openPersonId, closePerson } = usePersonDialog()

const open = computed({
  get: () => openPersonId.value !== null,
  set: (value) => {
    if (!value) closePerson()
  },
})
</script>

<style scoped>
.person-dialog {
  background: rgb(var(--v-theme-surface));
}
</style>
