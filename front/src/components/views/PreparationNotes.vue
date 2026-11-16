<template>
  <div class="d-flex flex-column ga-6">
    <h1 class="text-headline-medium">{{ $t('notes.title') }}</h1>

    <section v-if="corrections?.items.length">
      <HebrewText :text="corrections.title" tag="h2" class="text-title-large mb-3" />
      <v-card variant="outlined">
        <v-list class="py-0" bg-color="transparent">
          <template v-for="(item, i) in corrections.items" :key="i">
            <v-divider v-if="i > 0" />
            <v-list-item class="py-3">
              <div class="d-flex ga-3 align-start">
                <v-chip color="primary" variant="tonal" label class="flex-shrink-0">
                  {{ item.section }}
                </v-chip>
                <HebrewText :text="item.change" tag="p" class="text-body-large note-text" />
              </div>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </section>

    <section v-if="methodology">
      <h2 class="text-title-large mb-3">{{ $t('notes.method') }}</h2>
      <v-card variant="flat" color="surface">
        <v-card-text class="text-body-large note-text">
          <HebrewText :text="methodology" tag="p" />
        </v-card-text>
      </v-card>
    </section>

    <section>
      <h2 class="text-title-large mb-3">{{ $t('notes.source') }}</h2>
      <v-card variant="outlined">
        <v-card-item>
          <v-card-title class="text-title-medium">{{ source.ref }}</v-card-title>
          <template #append>
            <v-btn
              :href="source.sefariaUrl"
              target="_blank"
              rel="noopener"
              variant="text"
              size="small"
              append-icon="mdi-open-in-new"
            >
              Sefaria
            </v-btn>
          </template>
        </v-card-item>
        <v-list class="pt-0" bg-color="transparent">
          <v-list-item v-for="row in sourceRows" :key="row.label" :prepend-icon="row.icon">
            <v-list-item-title class="text-label-large">{{ row.label }}</v-list-item-title>
            <HebrewText :text="row.text" tag="p" class="text-body-medium text-medium-emphasis note-text" />
          </v-list-item>
        </v-list>
      </v-card>
    </section>
  </div>
</template>

<script setup lang="ts">
/** Notes de préparation : différences avec la structure du cours, méthode, texte source. */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTosafot } from '@/composables/useTosafot'
import { usePreferences } from '@/composables/usePreferences'
import { pickLevel } from '@/utils/levels'
import HebrewText from '@/components/common/HebrewText.vue'

const { doc } = useTosafot()
const { t } = useI18n()
const preferences = usePreferences()

const corrections = computed(() => doc.value.structureCorrections)
const methodology = computed(() => pickLevel(doc.value.meta.methodology, preferences.level))
const source = computed(() => doc.value.source)
const sourceRows = computed(() =>
  [
    { label: t('notes.edition'), text: source.value.edition, icon: 'mdi-book-open-page-variant-outline' },
    { label: t('notes.normalization'), text: source.value.normalization, icon: 'mdi-format-letter-matches' },
    { label: t('notes.tokenization'), text: source.value.tokenization, icon: 'mdi-content-cut' },
  ].filter((row): row is { label: string; text: string; icon: string } => Boolean(row.text)),
)
</script>

<style scoped>
.note-text {
  line-height: 1.7;
  white-space: normal;
}
</style>
