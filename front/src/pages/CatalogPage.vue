<template>
  <v-app-bar color="primary" flat>
    <v-app-bar-title>
      <HebrewText :text="$t('catalog.appBarTitle')" />
    </v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container class="catalog py-8">
      <HebrewText tag="h1" class="text-headline-medium mb-2" :text="$t('catalog.heading')" />
      <HebrewText
        tag="p"
        class="text-body-large text-medium-emphasis mb-6"
        :text="$t('catalog.intro')"
      />

      <div v-if="entries.length" class="d-flex flex-column ga-4">
        <CatalogEntryCard v-for="entry in entries" :key="entry.slug" :entry="entry" />
      </div>
      <v-alert v-else type="info" variant="tonal">
        {{ $t('catalog.empty', { folder: 'data/' }) }}
      </v-alert>

      <LoadCorrectedJson v-if="preferences.reviewMode" view="review" class="mt-8" />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { catalog } from '@/data/catalog'
import { usePreferences } from '@/composables/usePreferences'
import CatalogEntryCard from '@/components/catalog/CatalogEntryCard.vue'
import HebrewText from '@/components/common/HebrewText.vue'
import LoadCorrectedJson from '@/components/review/LoadCorrectedJson.vue'

const preferences = usePreferences()
// Les versions locales n'apparaissent qu'en mode relecture.
const entries = computed(() => catalog.filter((e) => !e.local || preferences.reviewMode))
</script>

<style scoped>
.catalog {
  max-width: 960px;
}
</style>
