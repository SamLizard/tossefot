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

      <div v-if="catalog.length" class="d-flex flex-column ga-4">
        <CatalogEntryCard v-for="entry in catalog" :key="entry.slug" :entry="entry" />
      </div>
      <v-alert v-else type="info" variant="tonal">
        {{ $t('catalog.empty', { folder: 'data/' }) }}
      </v-alert>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { catalog } from '@/data/catalog'
import CatalogEntryCard from '@/components/catalog/CatalogEntryCard.vue'
import HebrewText from '@/components/common/HebrewText.vue'
</script>

<style scoped>
.catalog {
  max-width: 960px;
}
</style>
