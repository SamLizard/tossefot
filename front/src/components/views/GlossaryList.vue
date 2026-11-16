<script setup lang="ts">
/** Liste « terme hébreu → explication », avec avertissement éventuel. */
import HebrewText from '@/components/common/HebrewText.vue'

export interface GlossaryItem {
  he: string
  text: string
  warning?: string
}

defineProps<{ items: GlossaryItem[] }>()
</script>

<template>
  <v-card v-if="items.length" variant="outlined" class="mt-2">
    <v-list class="py-0" bg-color="transparent">
      <template v-for="(item, i) in items" :key="item.he">
        <v-divider v-if="i > 0" />
        <v-list-item class="py-3">
          <div class="d-flex flex-wrap align-baseline ga-4">
            <p lang="he" dir="rtl" class="he-block term">{{ item.he }}</p>
            <div class="flex-1-1 entry">
              <HebrewText :text="item.text" tag="p" class="text-body-large" />
              <v-alert
                v-if="item.warning"
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-2 text-body-small"
              >
                <HebrewText :text="item.warning" />
              </v-alert>
            </div>
          </div>
        </v-list-item>
      </template>
    </v-list>
  </v-card>
  <p v-else class="text-medium-emphasis pa-4">Aucun résultat.</p>
</template>

<style scoped>
.term {
  min-width: 9rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}
.entry {
  min-width: 14rem;
}
</style>
