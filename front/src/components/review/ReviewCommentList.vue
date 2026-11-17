<template>
  <div class="d-flex flex-column ga-3">
    <div class="d-flex flex-wrap ga-3">
      <v-select
        v-model="statuses"
        :items="statusItems"
        :label="$t('reviewing.filterStatus')"
        multiple
        chips
        closable-chips
        clearable
        density="compact"
        hide-details
        class="filter"
      />
      <v-select
        v-model="types"
        :items="typeItems"
        :label="$t('reviewing.filterType')"
        multiple
        chips
        closable-chips
        clearable
        density="compact"
        hide-details
        class="filter"
      />
    </div>

    <v-alert v-if="!groups.length" type="info" variant="tonal">
      {{ all.length ? $t('reviewing.noMatch') : $t('reviewing.empty') }}
    </v-alert>

    <v-card v-for="group in groups" :key="group.key" variant="outlined" class="review-group">
      <v-card-item>
        <div class="d-flex align-start ga-2">
          <CommentTargetLabel :target="group.target" :show-field="false" class="flex-grow-1" />
          <v-btn
            v-if="group.target.segmentId || group.target.nodeId || group.target.tableId"
            variant="text"
            size="small"
            append-icon="mdi-arrow-right"
            @click="goToTarget(group.target)"
          >
            {{ $t('reviewing.open') }}
          </v-btn>
        </div>
      </v-card-item>
      <v-card-text class="d-flex flex-column ga-2">
        <CommentItem
          v-for="c in group.comments"
          :key="c.id"
          :comment="c"
          @edit="openFor(c.target, '', c.id)"
          @remove="remove(c.id)"
          @validate="update(c.id, { validated: true })"
          @reopen="update(c.id, { status: 'ouvert', validated: false })"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
/** Remarques groupées par élément, dans l'ordre du texte, avec filtres statut / type. */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CommentStatus, CommentTarget, CommentType, ReviewComment } from '@/types/review'
import { useReview } from '@/composables/useReview'
import { useCommentDialog } from '@/composables/useCommentDialog'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import { COMMENT_STATUSES, COMMENT_TYPES, targetKey } from '@/utils/reviewFields'
import CommentItem from './CommentItem.vue'
import CommentTargetLabel from './CommentTargetLabel.vue'

const { t } = useI18n()
const { all, update, remove } = useReview()
const { openFor } = useCommentDialog()
const { openSegment, openNode, openTable } = useSegmentPanel()

const statuses = ref<CommentStatus[]>([])
const types = ref<CommentType[]>([])
const statusItems = computed(() => COMMENT_STATUSES.map((d) => ({ value: d.id, title: t(d.labelKey) })))
const typeItems = computed(() => COMMENT_TYPES.map((d) => ({ value: d.id, title: t(d.labelKey) })))

const groups = computed(() => {
  const map = new Map<string, { key: string; target: CommentTarget; comments: ReviewComment[] }>()
  for (const c of all.value) {
    if (statuses.value.length && !statuses.value.includes(c.status)) continue
    if (types.value.length && !types.value.includes(c.type)) continue
    const key = targetKey(c.target)
    if (!map.has(key)) map.set(key, { key, target: { ...c.target, field: undefined }, comments: [] })
    map.get(key)!.comments.push(c)
  }
  return [...map.values()]
})

function goToTarget(target: CommentTarget) {
  if (target.segmentId) openSegment(target.segmentId)
  else if (target.nodeId) openNode(target.nodeId)
  else if (target.tableId) openTable(target.tableId)
}
</script>

<style scoped>
.filter {
  min-width: 220px;
  flex: 1 1 220px;
}
.review-group {
  border-inline-start: 4px solid rgb(var(--v-theme-secondary));
}
</style>
