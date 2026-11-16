<template>
  <div class="d-flex flex-column ga-8">
    <section>
      <h2 class="text-headline-small mb-4">{{ $t('synthesis.takeaways') }}</h2>
      <v-row>
        <v-col v-for="(item, i) in synthesis.takeaways" :key="i" cols="12" md="4">
          <v-card variant="outlined" class="h-100">
            <v-card-text class="d-flex flex-column ga-3">
              <v-avatar color="secondary" variant="flat" size="36" class="text-title-medium">
                {{ i + 1 }}
              </v-avatar>
              <HebrewText :text="item" tag="p" class="text-body-large" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <section v-if="halacha">
      <HebrewText tag="h2" class="text-headline-small mb-4" :text="$t('synthesis.halacha')" />
      <v-card variant="flat" color="surface" class="halacha">
        <v-card-text class="text-body-large">
          <HebrewText :text="halacha" tag="p" />
        </v-card-text>
      </v-card>
    </section>

    <section v-if="synthesis.review.length">
      <h2 class="text-headline-small mb-4">{{ $t('synthesis.review') }}</h2>
      <div class="d-flex flex-column ga-3">
        <ReviewQuestion v-for="(q, i) in synthesis.review" :key="i" :question="q" :index="i" />
      </div>
    </section>

    <section v-if="synthesis.nextPreview">
      <v-alert variant="tonal" color="primary" icon="mdi-arrow-right-circle-outline"
        :title="$t('synthesis.next')"
      >
        <HebrewText :text="synthesis.nextPreview" tag="p" />
      </v-alert>
    </section>
  </div>
</template>

<script setup lang="ts">
/** Vue « Synthèse » (docs/UI_SPEC.md §3.5). */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { pickLevel } from '@/utils/levels'
import HebrewText from '@/components/common/HebrewText.vue'
import ReviewQuestion from './ReviewQuestion.vue'

const { doc } = useTosafot()
const preferences = usePreferences()

const synthesis = computed(() => doc.value.synthesis)
const halacha = computed(() => pickLevel(synthesis.value.halacha, preferences.level))
</script>

<style scoped>
.halacha {
  border-inline-start: 4px solid rgb(var(--v-theme-primary));
  line-height: 1.7;
}
</style>
