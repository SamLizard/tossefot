<script setup lang="ts">
import { catalog } from '@/data/catalog'
import CatalogEntryCard from '@/components/catalog/CatalogEntryCard.vue'
</script>

<template>
  <v-app-bar color="primary" flat>
    <v-app-bar-title>
      <bdi lang="he" dir="rtl" class="he-inline">תוספות</bdi> expliqués
    </v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container class="catalog py-8">
      <h1 class="text-headline-medium mb-2">
        <bdi lang="he" dir="rtl" class="he-inline">תוספות</bdi> disponibles
      </h1>
      <p class="text-body-large text-medium-emphasis mb-6">
        Chaque <bdi lang="he" dir="rtl" class="he-inline">תוספות</bdi> est présenté phrase par phrase, avec
        sa structure, une traduction et des explications à trois niveaux.
      </p>

      <div v-if="catalog.length" class="d-flex flex-column ga-4">
        <CatalogEntryCard v-for="entry in catalog" :key="entry.slug" :entry="entry" />
      </div>
      <v-alert v-else type="info" variant="tonal">
        Aucun fichier JSON dans le dossier <code>data/</code>.
      </v-alert>
    </v-container>
  </v-main>
</template>

<style scoped>
.catalog {
  max-width: 960px;
}
</style>
