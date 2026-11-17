<template>
  <v-dialog v-model="open" max-width="680" scrollable>
    <v-card v-if="target" variant="flat" class="comment-dialog">
      <v-card-title class="d-flex align-start ga-2 pt-4 text-wrap">
        <v-icon icon="mdi-comment-edit-outline" color="secondary" />
        <span class="text-title-large flex-grow-1">
          {{ editingId ? $t('reviewing.editTitle', { id: editingId }) : $t('reviewing.newTitle') }}
        </span>
        <v-btn icon="mdi-close" variant="text" size="small" :aria-label="$t('common.close')" @click="close" />
      </v-card-title>

      <v-card-text class="d-flex flex-column ga-4">
        <CommentTargetLabel :target="target" :show-field="false" />
        <v-form @submit.prevent="save">
          <CommentForm v-model="draft" />
        </v-form>

        <template v-if="existing.length">
          <v-divider />
          <div class="text-title-small">{{ $t('reviewing.existing', { count: existing.length }) }}</div>
          <CommentItem
            v-for="c in existing"
            :key="c.id"
            :comment="c"
            @edit="startEdit(c)"
            @remove="remove(c.id)"
            @validate="update(c.id, { validated: true })"
            @reopen="update(c.id, { status: 'ouvert', validated: false })"
          />
        </template>
      </v-card-text>

      <v-card-actions>
        <v-btn v-if="editingId" variant="text" @click="resetDraft">{{ $t('reviewing.newInstead') }}</v-btn>
        <v-spacer />
        <v-btn variant="text" @click="close">{{ $t('reviewing.cancel') }}</v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-content-save-outline" :disabled="!draft.text.trim()" @click="save">
          {{ $t('reviewing.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
/** Dialogue « Commenter » : nouvelle remarque ou modification, et remarques déjà faites sur la cible. */
import { computed, ref, watch } from 'vue'
import type { CommentDraft, ReviewComment } from '@/types/review'
import { useReview } from '@/composables/useReview'
import { useCommentDialog } from '@/composables/useCommentDialog'
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'
import CommentTargetLabel from './CommentTargetLabel.vue'

const { target, quote, editId, close } = useCommentDialog()
const { all, byTarget, add, update, remove } = useReview()

const draft = ref<CommentDraft>({ target: {}, type: 'erreur', text: '' })
const editingId = ref<string | null>(null)

const open = computed({
  get: () => target.value !== null,
  set: (value) => {
    if (!value) close()
  },
})
const existing = computed(() => (target.value ? byTarget(target.value) : []))

function resetDraft() {
  editingId.value = null
  draft.value = { target: { ...target.value }, type: 'erreur', quote: quote.value, text: '' }
}

function startEdit(c: ReviewComment) {
  editingId.value = c.id
  draft.value = { target: { ...c.target }, type: c.type, quote: c.quote ?? '', text: c.text }
}

watch(target, (value) => {
  if (!value) return
  const toEdit = editId.value ? all.value.find((c) => c.id === editId.value) : undefined
  if (toEdit) startEdit(toEdit)
  else resetDraft()
})

function save() {
  const text = draft.value.text.trim()
  if (!text) return
  const target = { ...draft.value.target }
  if (!target.field) delete target.field
  const payload = { target, type: draft.value.type, quote: draft.value.quote?.trim() || undefined, text }
  if (editingId.value) update(editingId.value, payload)
  else add(payload)
  close()
}
</script>
