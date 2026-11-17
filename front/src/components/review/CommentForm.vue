<template>
  <div class="d-flex flex-column ga-3">
    <v-chip-group v-model="draft.type" mandatory selected-class="font-weight-bold" column :aria-label="$t('reviewing.type')">
      <v-chip
        v-for="def in COMMENT_TYPES"
        :key="def.id"
        :value="def.id"
        :color="def.color"
        :prepend-icon="def.icon"
        variant="outlined"
        filter
      >
        {{ $t(def.labelKey) }}
      </v-chip>
    </v-chip-group>

    <v-select
      v-if="fields.length"
      v-model="draft.target.field"
      :items="fields"
      :label="$t('reviewing.field')"
      clearable
      density="compact"
      hide-details
    />

    <v-textarea
      v-model="draft.quote"
      :label="$t('reviewing.quote')"
      :hint="$t('reviewing.quoteHint')"
      persistent-hint
      rows="1"
      auto-grow
      density="compact"
      dir="auto"
      class="quote"
    />

    <v-textarea
      v-model="draft.text"
      :label="$t('reviewing.text')"
      rows="3"
      auto-grow
      autofocus
      dir="auto"
      hide-details="auto"
      :rules="[(v: string) => Boolean(v?.trim()) || $t('reviewing.textRequired')]"
    />
  </div>
</template>

<script setup lang="ts">
/** Champs d'une remarque : type, champ visé, citation, texte. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CommentDraft } from '@/types/review'
import { COMMENT_TYPES, TARGET_FIELDS, targetKind } from '@/utils/reviewFields'

const draft = defineModel<CommentDraft>({ required: true })
const { t } = useI18n()

const fields = computed(() => {
  const kind = targetKind(draft.value.target)
  return kind ? TARGET_FIELDS[kind].map((f) => ({ value: f.id, title: t(f.labelKey) })) : []
})
</script>

<style scoped>
.quote :deep(textarea) {
  font-size: 0.95rem;
}
</style>
