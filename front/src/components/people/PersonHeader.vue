<template>
  <div class="person-header px-5 py-4 d-flex flex-column ga-2">
    <div class="d-flex align-start ga-3">
      <div class="flex-grow-1 d-flex flex-column ga-1">
        <bdi lang="he" dir="rtl" class="he-inline person-name">{{ person.name }}</bdi>
        <bdi v-if="person.full && person.full !== person.name" lang="he" dir="rtl" class="he-inline text-title-medium">
          {{ person.full }}
        </bdi>
      </div>
      <slot name="actions" />
    </div>
    <div class="d-flex flex-wrap align-center ga-2">
      <v-chip size="small" variant="flat" color="secondary" label>
        <bdi lang="he" dir="rtl">{{ person.type }}</bdi>
      </v-chip>
      <v-chip v-if="person.era" size="small" variant="outlined" prepend-icon="mdi-history" label>
        <bdi lang="he" dir="rtl">{{ person.era }}</bdi>
      </v-chip>
      <v-chip
        v-for="place in person.places ?? []"
        :key="place"
        size="small"
        variant="text"
        prepend-icon="mdi-map-marker-outline"
        label
      >
        <bdi lang="he" dir="rtl">{{ place }}</bdi>
      </v-chip>
      <span v-if="dates" class="text-label-large text-medium-emphasis d-inline-flex align-center ga-1">
        <v-icon icon="mdi-calendar-range" size="small" />
        <span>{{ dates }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
/** Bandeau d'en-tête d'une fiche de personne : nom, nom complet, type, époque, lieux, dates. */
import { computed } from 'vue'
import type { Person } from '@/types/tosafot'
import { formatPersonDates } from '@/utils/personDates'

const props = defineProps<{ person: Person }>()

const dates = computed(() => formatPersonDates(props.person.dates))
</script>

<style scoped>
/* Teinte légère du secondaire : le texte reste en on-surface (contraste vérifié). */
.person-header {
  background: rgba(var(--v-theme-secondary), 0.12);
  border-bottom: thin solid rgba(var(--v-theme-secondary), 0.35);
}
.person-name {
  font-size: 1.9rem;
  line-height: 1.3;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}
</style>
