<template>
  <div class="d-flex flex-column ga-5">
    <div class="d-flex align-center flex-wrap ga-3">
      <v-icon icon="mdi-comment-edit-outline" color="secondary" size="large" />
      <h1 class="text-headline-small flex-grow-1">{{ $t('reviewing.pageTitle') }}</h1>
      <v-chip
        v-for="s in statusCounts"
        :key="s.id"
        :color="s.color"
        size="small"
        label
        variant="tonal"
      >
        {{ $t(s.labelKey) }} : {{ s.count }}
      </v-chip>
    </div>

    <v-alert v-if="localInfo" type="info" variant="tonal" density="compact" icon="mdi-laptop">
      <HebrewText :text="$t('reviewing.localVersion', { date: localInfo })" />
    </v-alert>
    <v-alert v-if="logApplied" type="success" variant="tonal" density="compact" icon="mdi-robot-outline" closable>
      {{ $t('reviewing.logApplied', { count: logApplied }) }}
    </v-alert>

    <v-text-field
      v-model="reviewer"
      :label="$t('reviewing.reviewer')"
      prepend-inner-icon="mdi-account-outline"
      density="compact"
      hide-details
      dir="auto"
      class="reviewer"
    />

    <ReviewActions />
    <VersionChanges />
    <ReviewCommentList />
    <LoadCorrectedJson />
  </div>
</template>

<script setup lang="ts">
/** Page « Relecture » : remarques, envoi à l'IA, nouvelle version et ses changements. */
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { findEntry } from '@/data/catalog'
import { useReview } from '@/composables/useReview'
import { COMMENT_STATUSES } from '@/utils/reviewFields'
import HebrewText from '@/components/common/HebrewText.vue'
import ReviewActions from './ReviewActions.vue'
import ReviewCommentList from './ReviewCommentList.vue'
import VersionChanges from './VersionChanges.vue'
import LoadCorrectedJson from './LoadCorrectedJson.vue'

const route = useRoute()
const { reviewer, counts, applyLog } = useReview()

const statusCounts = computed(() =>
  COMMENT_STATUSES.map((d) => ({ ...d, count: counts.value.byStatus[d.id] ?? 0 })).filter((d) => d.count),
)
const localInfo = computed(() => {
  const local = findEntry(String(route.params.slug ?? ''))?.local
  return local ? new Date(local.importedAt).toLocaleString() : ''
})

// Les réponses de l'IA (`reviewLog`) sont lues à l'ouverture de la page.
const logApplied = ref(0)
onMounted(() => {
  logApplied.value = applyLog()
})
</script>

<style scoped>
.reviewer {
  max-width: 420px;
}
</style>
