<template>
  <div v-if="groups.length" class="d-flex flex-column ga-2">
    <div v-for="g in groups" :key="g.labelKey" class="d-flex flex-wrap align-center ga-2">
      <span class="text-label-large text-medium-emphasis relation-label">{{ $t(g.labelKey) }}</span>
      <v-chip
        v-for="r in g.people"
        :key="r.id"
        size="small"
        variant="tonal"
        color="primary"
        prepend-icon="mdi-account-outline"
        :aria-label="$t('people.open', { name: r.name })"
        @click="openPerson(r.id)"
      >
        <bdi lang="he" dir="rtl">{{ r.name }}</bdi>
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
/** Maîtres, élèves et collègues d'une personne ; un clic ouvre leur fiche. */
import { computed } from 'vue'
import type { Person } from '@/types/tosafot'
import { useTosafot } from '@/composables/useTosafot'
import { usePersonDialog } from '@/composables/usePersonDialog'

const props = defineProps<{ person: Person }>()

const { person: findPerson } = useTosafot()
const { openPerson } = usePersonDialog()

const groups = computed(() =>
  (
    [
      { labelKey: 'people.teachers', ids: props.person.teachers },
      { labelKey: 'people.students', ids: props.person.students },
      { labelKey: 'people.colleagues', ids: props.person.colleagues },
    ] as const
  )
    .map((g) => ({
      labelKey: g.labelKey,
      people: (g.ids ?? []).map((id) => ({ id, name: findPerson(id)?.name ?? id })),
    }))
    .filter((g) => g.people.length > 0),
)
</script>

<style scoped>
.relation-label {
  min-width: 5.5rem;
}
</style>
