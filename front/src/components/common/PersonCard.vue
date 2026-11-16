<template>
  <v-card v-if="p" variant="outlined" class="person-card">
    <v-card-item>
      <v-card-title class="d-flex align-center ga-2 flex-wrap">
        <bdi lang="he" dir="rtl" class="he-inline person-name">{{ p.name }}</bdi>
        <v-chip size="x-small" variant="tonal" color="secondary" label>
          <HebrewText :text="p.type" />
        </v-chip>
      </v-card-title>
      <v-card-subtitle v-if="p.full">
        <bdi lang="he" dir="rtl" class="he-inline">{{ p.full }}</bdi>
      </v-card-subtitle>
    </v-card-item>
    <v-card-text class="text-body-medium">
      <HebrewText :text="p.description" />
    </v-card-text>
  </v-card>
  <v-alert v-else type="warning" variant="tonal" density="compact">
    {{ $t('person.unknown', { id: personId }) }}
  </v-alert>
</template>

<script setup lang="ts">
/** Fiche d'une personne citée (docs/UI_SPEC.md §6). */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import HebrewText from '@/components/common/HebrewText.vue'

const props = defineProps<{ personId: string }>()

const { person } = useTosafot()
const p = computed(() => person(props.personId))
</script>

<style scoped>
.person-name {
  font-size: 1.4rem;
}
</style>
