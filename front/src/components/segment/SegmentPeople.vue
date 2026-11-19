<template>
  <div v-if="people.length" class="d-flex flex-wrap align-center ga-2">
    <span class="text-label-large text-medium-emphasis">{{ $t('people.inThisSegment') }}</span>
    <v-tooltip v-for="p in people" :key="p.id">
      <template #activator="{ props: tooltip }">
        <v-chip
          v-bind="tooltip"
          size="small"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-account-outline"
          :aria-label="$t('people.open', { name: p.name })"
          @click="openPerson(p.id)"
        >
          <bdi lang="he" dir="rtl">{{ p.name }}</bdi>
        </v-chip>
      </template>
      <bdi v-if="p.full" lang="he" dir="rtl" class="d-block font-weight-bold">{{ p.full }}</bdi>
      <bdi v-if="p.era" lang="he" dir="rtl" class="d-block">{{ p.era }}</bdi>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
/** Personnes citées dans un segment (`peopleIds`) ; un clic ouvre leur fiche. */
import { computed } from 'vue'
import type { Person } from '@/types/tosafot'
import { useTosafot } from '@/composables/useTosafot'
import { usePersonDialog } from '@/composables/usePersonDialog'

const props = defineProps<{ peopleIds: string[] }>()

const { person } = useTosafot()
const { openPerson } = usePersonDialog()

const people = computed(() =>
  props.peopleIds.map((id) => person(id)).filter((p): p is Person => p !== undefined),
)
</script>
