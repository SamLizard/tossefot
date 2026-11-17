<template>
  <v-btn
    v-if="preferences.reviewMode"
    icon
    variant="text"
    :size="size"
    density="comfortable"
    color="secondary"
    class="comment-button"
    :aria-label="$t('reviewing.commentAria', { count })"
    @pointerdown="selection = currentSelection()"
    @click.stop="open"
    @keydown.enter.stop
    @keydown.space.stop
  >
    <v-badge v-if="count" :content="count" color="secondary" floating>
      <v-icon icon="mdi-comment-plus-outline" />
    </v-badge>
    <v-icon v-else icon="mdi-comment-plus-outline" />
  </v-btn>
</template>

<script setup lang="ts">
/** Bouton « Commenter » (mode relecture seulement) ; badge = nombre de remarques sur la cible. */
import { computed, ref } from 'vue'
import type { CommentTarget } from '@/types/review'
import { usePreferences } from '@/composables/usePreferences'
import { useReview } from '@/composables/useReview'
import { currentSelection, useCommentDialog } from '@/composables/useCommentDialog'

const props = withDefaults(defineProps<{ target: CommentTarget; size?: string }>(), { size: 'small' })

const preferences = usePreferences()
const { byTarget } = useReview()
const { openFor } = useCommentDialog()

// Lue au pointerdown : le clic peut déjà avoir effacé la sélection.
const selection = ref('')
const count = computed(() => (preferences.reviewMode ? byTarget(props.target).length : 0))

function open() {
  openFor(props.target, selection.value || currentSelection())
  selection.value = ''
}
</script>
