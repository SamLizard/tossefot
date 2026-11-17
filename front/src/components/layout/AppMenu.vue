<template>
  <v-menu location="bottom end">
    <template #activator="{ props: activator }">
      <v-btn v-bind="activator" icon="mdi-dots-vertical" variant="text" :aria-label="$t('menu.label')" />
    </template>
    <v-list density="comfortable" min-width="240">
      <template v-if="compact">
        <v-list-subheader>{{ $t('levels.label') }}</v-list-subheader>
        <v-list-item
          v-for="level in levels"
          :key="level.id"
          :title="level.label"
          :active="preferences.level === level.id"
          :prepend-icon="preferences.level === level.id ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
          @click="preferences.level = level.id"
        />
        <v-list-item
          v-if="hasShomrim"
          prepend-icon="mdi-shield-account-outline"
          @click="openTable('t-shomrim')"
        >
          <v-list-item-title><HebrewText :text="$t('shomrim.label')" /></v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
      </template>
      <v-list-item prepend-icon="mdi-book-alphabet" :title="$t('menu.glossary')" @click="goTo('glossary')" />
      <v-list-item
        prepend-icon="mdi-notebook-edit-outline"
        :title="$t('menu.notes')"
        @click="goTo('notes')"
      />
      <v-list-item
        prepend-icon="mdi-tune-variant"
        :title="$t('menu.preferences')"
        @click="emit('open-preferences')"
      />
      <v-divider class="my-1" />
      <ReviewMenuItems />
      <v-divider class="my-1" />
      <v-list-item prepend-icon="mdi-bookshelf" :to="{ name: 'catalog' }">
        <v-list-item-title><HebrewText :text="$t('menu.otherTosafot')" /></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
/** Menu « ⋮ » de la barre d'app. Sur petit écran, reprend le niveau et « Les 4 שומרים ». */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import { useViewNavigation } from '@/composables/useViewNavigation'
import HebrewText from '@/components/common/HebrewText.vue'
import ReviewMenuItems from '@/components/review/ReviewMenuItems.vue'

withDefaults(defineProps<{ compact?: boolean; hasShomrim?: boolean }>(), {
  compact: false,
  hasShomrim: false,
})
const emit = defineEmits<{ 'open-preferences': [] }>()

const { doc } = useTosafot()
const preferences = usePreferences()
const { openTable } = useSegmentPanel()
const { goTo } = useViewNavigation()

const levels = computed(() => doc.value.meta.levels)
</script>
