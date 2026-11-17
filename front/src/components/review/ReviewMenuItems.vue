<template>
  <v-list-item>
    <v-switch
      v-model="preferences.reviewMode"
      :label="$t('reviewing.mode')"
      color="secondary"
      density="compact"
      hide-details
      inset
      class="review-switch"
    />
  </v-list-item>
  <v-list-item
    v-if="preferences.reviewMode"
    prepend-icon="mdi-comment-text-multiple-outline"
    :title="$t('reviewing.menuEntry', { count: counts.total })"
    @click="goTo('review')"
  />
</template>

<script setup lang="ts">
/** Entrées du menu « ⋮ » : interrupteur « Mode relecture » et lien vers la page Relecture. */
import { usePreferences } from '@/composables/usePreferences'
import { useReview } from '@/composables/useReview'
import { useViewNavigation } from '@/composables/useViewNavigation'

const preferences = usePreferences()
const { counts } = useReview()
const { goTo } = useViewNavigation()
</script>
