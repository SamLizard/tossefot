<template>
  <v-chip
    v-if="preferences.reviewMode"
    color="secondary"
    variant="tonal"
    prepend-icon="mdi-comment-edit-outline"
    :size="compact ? 'small' : 'default'"
    @click="goTo('review')"
  >
    <span v-if="!compact">{{ $t('reviewing.mode') }}</span>
    <v-badge v-if="counts.pending" :content="counts.pending" color="secondary" inline />
  </v-chip>
</template>

<script setup lang="ts">
/** Indicateur « Mode relecture » dans la barre d'app ; clic → page Relecture. */
import { usePreferences } from '@/composables/usePreferences'
import { useReview } from '@/composables/useReview'
import { useViewNavigation } from '@/composables/useViewNavigation'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const preferences = usePreferences()
const { counts } = useReview()
const { goTo } = useViewNavigation()
</script>
