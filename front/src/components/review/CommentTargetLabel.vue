<template>
  <div class="d-flex flex-column ga-1 target-label">
    <div class="d-flex align-center flex-wrap ga-2 text-label-large">
      <v-icon :icon="icon" size="small" color="secondary" />
      <span class="font-weight-bold">{{ heading }}</span>
      <span v-if="fieldKey" class="text-medium-emphasis">· {{ $t(fieldKey) }}</span>
    </div>
    <p v-if="excerpt" lang="he" dir="rtl" class="he-block he-tosafot excerpt text-medium-emphasis">{{ excerpt }}</p>
    <HebrewText v-else-if="title" :text="title" tag="div" class="text-body-medium text-medium-emphasis" />
  </div>
</template>

<script setup lang="ts">
/** Cible d'une remarque : « Segment s7 · I.3 », champ, et extrait hébreu ou titre. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CommentTarget } from '@/types/review'
import { useTosafot } from '@/composables/useTosafot'
import { fieldLabelKey, targetKind } from '@/utils/reviewFields'
import HebrewText from '@/components/common/HebrewText.vue'

const props = withDefaults(defineProps<{ target: CommentTarget; showField?: boolean }>(), { showField: true })

const { t } = useI18n()
const { segment, node, table } = useTosafot()

const kind = computed(() => targetKind(props.target))
const icon = computed(
  () => ({ segment: 'mdi-format-quote-open', node: 'mdi-file-tree-outline', table: 'mdi-table' })[kind.value ?? 'segment'],
)
const seg = computed(() => (props.target.segmentId ? segment(props.target.segmentId) : undefined))

const heading = computed(() => {
  const { segmentId, nodeId, tableId } = props.target
  if (segmentId) return t('reviewing.targetSegment', { id: segmentId, node: seg.value?.nodeId ?? '?' })
  if (nodeId) return t('reviewing.targetNode', { id: nodeId })
  if (tableId) return t('reviewing.targetTable', { id: tableId })
  return t('reviewing.targetGeneral')
})
const fieldKey = computed(() => (props.showField ? fieldLabelKey(kind.value, props.target.field) : undefined))

const EXCERPT_WORDS = 12
const excerpt = computed(() => {
  const words = seg.value?.he.split(/\s+/) ?? []
  return words.length > EXCERPT_WORDS ? words.slice(0, EXCERPT_WORDS).join(' ') + ' …' : words.join(' ')
})
const title = computed(() => {
  const { nodeId, tableId } = props.target
  if (nodeId) return node(nodeId)?.title ?? ''
  if (tableId) return table(tableId)?.title ?? ''
  return ''
})
</script>

<style scoped>
.target-label {
  min-width: 0;
}
.excerpt {
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0;
}
</style>
