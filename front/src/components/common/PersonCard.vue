<template>
  <v-card v-if="p" variant="outlined" class="person-card d-flex flex-column" :data-person-id="p.id">
    <PersonHeader :person="p">
      <template #actions><slot name="actions" /></template>
    </PersonHeader>
    <v-card-text class="d-flex flex-column ga-4 pa-5 flex-grow-1">
      <HebrewText :text="summary" tag="p" class="text-body-large summary" />
      <div v-if="p.aliases?.length" class="d-flex flex-wrap align-center ga-1">
        <span class="text-label-large text-medium-emphasis me-1">{{ $t('people.aliases') }}</span>
        <v-chip v-for="a in p.aliases" :key="a" size="x-small" variant="tonal" label>
          <bdi lang="he" dir="rtl">{{ a }}</bdi>
        </v-chip>
      </div>
      <v-alert
        v-for="c in p.confusions ?? []"
        :key="c.he"
        type="warning"
        variant="tonal"
        density="compact"
        icon="mdi-alert-circle-outline"
      >
        <HebrewText :text="$t('people.confusion', { name: c.he })" tag="p" class="text-label-large font-weight-bold" />
        <HebrewText :text="c.note" tag="p" class="text-body-medium mt-1" />
      </v-alert>
      <template v-if="!compact">
        <PersonRelations :person="p" />
        <PersonSegments :segment-ids="p.segmentIds ?? []" />
      </template>
    </v-card-text>
    <v-divider />
    <v-card-actions class="px-5 py-3 flex-wrap ga-2">
      <PersonLinks :links="p.links" />
      <v-spacer />
      <v-btn
        v-if="compact"
        variant="tonal"
        color="primary"
        size="small"
        prepend-icon="mdi-card-account-details-outline"
        @click="openPerson(p.id)"
      >
        {{ $t('people.viewCard') }}
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-alert v-else type="warning" variant="tonal" density="compact">
    {{ $t('person.unknown', { id: personId }) }}
  </v-alert>
</template>

<script setup lang="ts">
/** Fiche d'une personne citée (docs/UI_SPEC.md §6). `compact` : version de la grille du glossaire. */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { usePersonDialog } from '@/composables/usePersonDialog'
import { pickLevel } from '@/utils/levels'
import HebrewText from '@/components/common/HebrewText.vue'
import PersonHeader from '@/components/people/PersonHeader.vue'
import PersonRelations from '@/components/people/PersonRelations.vue'
import PersonSegments from '@/components/people/PersonSegments.vue'
import PersonLinks from '@/components/people/PersonLinks.vue'

const props = withDefaults(defineProps<{ personId: string; compact?: boolean }>(), { compact: false })

const { person } = useTosafot()
const preferences = usePreferences()
const { openPerson } = usePersonDialog()

const p = computed(() => person(props.personId))
const summary = computed(() => {
  const current = p.value
  if (!current) return ''
  return pickLevel(current.summary ?? { essentiel: current.description }, preferences.level) || current.description
})
</script>

<style scoped>
.person-card {
  height: 100%;
  overflow: hidden;
}
.summary {
  line-height: 1.7;
}
</style>
