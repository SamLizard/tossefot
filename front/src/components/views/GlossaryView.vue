<template>
  <div class="d-flex flex-column ga-4">
    <h1 class="text-headline-medium">{{ $t('glossary.title') }}</h1>
    <v-text-field
      v-model="query"
      prepend-inner-icon="mdi-magnify"
      :label="$t('glossary.search')"
      variant="outlined"
      density="comfortable"
      clearable
      hide-details
    />

    <v-tabs v-model="tab" color="primary">
      <v-tab value="glossary" prepend-icon="mdi-book-alphabet">
        {{ $t('glossary.tabGlossary') }}
        <v-chip size="x-small" class="ms-2" label>{{ glossary.length }}</v-chip>
      </v-tab>
      <v-tab value="abbreviations" prepend-icon="mdi-format-letter-case">
        {{ $t('glossary.tabAbbreviations') }}
        <v-chip size="x-small" class="ms-2" label>{{ abbreviations.length }}</v-chip>
      </v-tab>
      <v-tab value="people" prepend-icon="mdi-account-group-outline">
        {{ $t('glossary.tabPeople') }}
        <v-chip size="x-small" class="ms-2" label>{{ people.length }}</v-chip>
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="glossary">
        <GlossaryList :items="glossary" />
      </v-window-item>
      <v-window-item value="abbreviations">
        <GlossaryList :items="abbreviations" />
      </v-window-item>
      <v-window-item value="people">
        <v-row v-if="people.length" class="pt-2">
          <v-col v-for="p in people" :key="p.id" cols="12" sm="6">
            <PersonCard :person-id="p.id" />
          </v-col>
        </v-row>
        <p v-else class="text-medium-emphasis pa-4">{{ $t('glossary.noResult') }}</p>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
/** Glossaire, abréviations et personnes (docs/UI_SPEC.md §6), avec recherche. */
import { computed, ref } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { matchesQuery } from '@/utils/search'
import GlossaryList, { type GlossaryItem } from './GlossaryList.vue'
import PersonCard from '@/components/common/PersonCard.vue'

const { doc } = useTosafot()
const query = ref('')
const tab = ref<'glossary' | 'abbreviations' | 'people'>('glossary')

const glossary = computed<GlossaryItem[]>(() =>
  doc.value.glossary
    .filter((g) => matchesQuery(query.value, g.he, g.fr))
    .map((g) => ({ he: g.he, text: g.fr })),
)
const abbreviations = computed<GlossaryItem[]>(() =>
  doc.value.abbreviations
    .filter((a) => matchesQuery(query.value, a.he, a.full, a.warning))
    .map((a) => ({ he: a.he, text: a.full, warning: a.warning })),
)
const people = computed(() =>
  doc.value.people.filter((p) => matchesQuery(query.value, p.name, p.full, p.type, p.description)),
)
</script>
