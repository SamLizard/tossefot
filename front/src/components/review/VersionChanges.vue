<template>
  <v-card v-if="snapshot" variant="outlined" class="pa-4 d-flex flex-column ga-3">
    <div class="text-title-medium">{{ $t('changes.title') }}</div>
    <HebrewText
      :text="$t('changes.intro', { version: snapshot.version, date: new Date(snapshot.takenAt).toLocaleString() })"
      tag="p"
      class="text-body-medium text-medium-emphasis"
    />
    <v-alert v-if="!changes.length" type="success" variant="tonal" density="compact">
      {{ $t('changes.none') }}
    </v-alert>

    <v-expansion-panels v-else variant="accordion" multiple>
      <v-expansion-panel v-for="item in changes" :key="item.kind + item.id">
        <v-expansion-panel-title>
          <div class="d-flex align-center flex-wrap ga-2">
            <v-icon :icon="item.kind === 'segment' ? 'mdi-format-quote-open' : 'mdi-file-tree-outline'" size="small" />
            <span class="font-weight-bold">{{ item.id }}</span>
            <v-chip v-if="item.state !== 'changed'" size="x-small" label :color="item.state === 'added' ? 'success' : 'error'">
              {{ $t(`changes.${item.state}`) }}
            </v-chip>
            <span class="text-label-medium text-medium-emphasis">{{ fieldNames(item) }}</span>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div v-for="f in item.fields" :key="f.field" class="mb-3">
            <div class="text-label-large text-medium-emphasis mb-1">{{ fieldName(item, f.field) }}</div>
            <WordDiff :before="f.before" :after="f.after" :hebrew="f.field === 'he'" />
          </div>
          <v-btn v-if="item.state !== 'removed'" size="small" variant="text" append-icon="mdi-arrow-right" @click="openItem(item)">
            {{ $t('reviewing.open') }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup lang="ts">
/** Ce qui a changé depuis la version relue (instantané pris à l'envoi des remarques). */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTosafot } from '@/composables/useTosafot'
import { useReview } from '@/composables/useReview'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import { compareSnapshots, takeSnapshot, type ItemChange } from '@/utils/reviewDiff'
import { fieldLabelKey } from '@/utils/reviewFields'
import HebrewText from '@/components/common/HebrewText.vue'
import WordDiff from './WordDiff.vue'

const { t } = useI18n()
const { doc } = useTosafot()
const review = useReview()
const { openSegment, openNode } = useSegmentPanel()

const snapshot = review.snapshot
const changes = computed(() =>
  snapshot.value ? compareSnapshots(snapshot.value, takeSnapshot(doc.value, '')) : [],
)

function fieldName(item: ItemChange, field: string): string {
  const key = fieldLabelKey(item.kind, field)
  return key ? t(key) : field
}

function fieldNames(item: ItemChange): string {
  return item.fields.map((f) => fieldName(item, f.field)).join(', ')
}

function openItem(item: ItemChange) {
  if (item.kind === 'segment') openSegment(item.id)
  else openNode(item.id)
}
</script>
