<script setup lang="ts">
/** Vue « Contexte » (docs/UI_SPEC.md §3.4) : avant la lecture. */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { useViewNavigation } from '@/composables/useViewNavigation'
import { pickLevel } from '@/utils/levels'
import HebrewText from '@/components/common/HebrewText.vue'
import DataTable from '@/components/tables/DataTable.vue'
import GemaraPassageCard from './GemaraPassageCard.vue'

const { doc } = useTosafot()
const preferences = usePreferences()
const { goTo } = useViewNavigation()

const context = computed(() => doc.value.context)
const intro = computed(() => pickLevel(context.value.levels, preferences.level))
</script>

<template>
  <div class="d-flex flex-column ga-6">
    <header>
      <HebrewText :text="context.title" tag="h1" class="text-headline-medium mb-3" />
      <v-card variant="flat" color="surface">
        <v-card-text class="text-body-large intro">
          <HebrewText :text="intro" tag="p" />
        </v-card-text>
      </v-card>
    </header>

    <section v-if="context.gemara.length">
      <h2 class="text-title-large mb-3">
        La <bdi lang="he" dir="rtl" class="he-inline">גמרא</bdi>
      </h2>
      <div class="d-flex flex-column ga-3">
        <GemaraPassageCard v-for="(passage, i) in context.gemara" :key="i" :passage="passage" />
      </div>
    </section>

    <section v-if="context.tableIds.length" class="d-flex flex-column ga-4">
      <h2 class="text-title-large">Tableaux de référence</h2>
      <DataTable v-for="id in context.tableIds" :key="id" :table-id="id" />
    </section>

    <div class="d-flex justify-center py-4">
      <v-btn
        color="primary"
        size="large"
        variant="flat"
        append-icon="mdi-arrow-right"
        @click="goTo('structure')"
      >
        Commencer la lecture
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.intro {
  line-height: 1.7;
}
</style>
