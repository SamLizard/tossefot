<template>
  <v-sheet rounded="lg" border class="pa-3 d-flex flex-column ga-2">
    <div class="d-flex align-center flex-wrap ga-2">
      <v-chip :color="type.color" :prepend-icon="type.icon" size="small" label variant="tonal">
        {{ $t(type.labelKey) }}
      </v-chip>
      <v-chip :color="status.color" size="small" label variant="outlined">{{ $t(status.labelKey) }}</v-chip>
      <span v-if="fieldKey" class="text-label-medium text-medium-emphasis">{{ $t(fieldKey) }}</span>
      <v-spacer />
      <span class="text-label-small text-medium-emphasis">{{ comment.id }}</span>
      <v-btn icon="mdi-pencil-outline" size="x-small" variant="text" :aria-label="$t('reviewing.edit')" @click="emit('edit')" />
      <v-btn icon="mdi-delete-outline" size="x-small" variant="text" :aria-label="$t('reviewing.delete')" @click="emit('remove')" />
    </div>

    <v-sheet v-if="comment.quote" color="surface-variant" rounded class="px-3 py-1 text-body-medium">
      « <HebrewText :text="comment.quote" /> »
    </v-sheet>
    <HebrewText :text="comment.text" tag="p" class="text-body-medium comment-text" />

    <v-alert
      v-if="comment.response"
      :color="status.color"
      variant="tonal"
      density="compact"
      icon="mdi-robot-outline"
      :title="$t('reviewing.aiAnswer')"
    >
      <HebrewText v-if="comment.response.change" :text="comment.response.change" tag="p" class="text-body-medium" />
      <HebrewText v-if="comment.response.answer" :text="comment.response.answer" tag="p" class="text-body-medium" />
      <div v-if="comment.response.targets?.length" class="text-label-medium text-medium-emphasis">
        {{ $t('reviewing.aiTargets', { targets: comment.response.targets.join(', ') }) }}
      </div>
      <div v-if="!pending" class="d-flex align-center ga-2 mt-2">
        <v-chip v-if="comment.validated" color="success" size="small" prepend-icon="mdi-check">
          {{ $t('reviewing.validated') }}
        </v-chip>
        <v-btn v-else size="small" color="success" variant="flat" prepend-icon="mdi-check" @click="emit('validate')">
          {{ $t('reviewing.validate') }}
        </v-btn>
        <v-btn size="small" variant="text" prepend-icon="mdi-restore" @click="emit('reopen')">
          {{ $t('reviewing.reopen') }}
        </v-btn>
      </div>
    </v-alert>
  </v-sheet>
</template>

<script setup lang="ts">
/** Une remarque : type, statut, citation, texte, et réponse de l'IA (Valider / Rouvrir). */
import { computed } from 'vue'
import type { ReviewComment } from '@/types/review'
import { fieldLabelKey, statusDef, targetKind, typeDef } from '@/utils/reviewFields'
import { isPending } from '@/utils/reviewFile'
import HebrewText from '@/components/common/HebrewText.vue'

const props = defineProps<{ comment: ReviewComment }>()
const emit = defineEmits<{ edit: []; remove: []; validate: []; reopen: [] }>()

const type = computed(() => typeDef(props.comment.type))
const status = computed(() => statusDef(props.comment.status))
const pending = computed(() => isPending(props.comment))
const fieldKey = computed(() => fieldLabelKey(targetKind(props.comment.target), props.comment.target.field))
</script>

<style scoped>
.comment-text {
  white-space: pre-line;
  margin: 0;
}
</style>
