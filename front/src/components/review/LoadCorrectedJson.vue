<template>
  <v-card variant="outlined" class="pa-4 d-flex flex-column ga-3">
    <div class="text-title-medium">{{ $t('loadDoc.title') }}</div>
    <HebrewText :text="$t('loadDoc.intro')" tag="p" class="text-body-medium text-medium-emphasis" />
    <v-file-input
      v-model="file"
      accept=".json,application/json"
      :label="$t('loadDoc.input')"
      prepend-icon="mdi-file-upload-outline"
      density="compact"
      :loading="busy"
      hide-details
      @update:model-value="load"
    />

    <v-alert v-if="errors.length" type="error" variant="tonal" :title="$t('loadDoc.invalid')">
      <ul class="ps-4">
        <li v-for="(e, i) in errors" :key="i"><HebrewText :text="e" /></li>
      </ul>
    </v-alert>

    <template v-if="loaded">
      <IntegrityResult :report="loaded.report" />
      <v-alert type="success" variant="tonal" density="compact" icon="mdi-content-save-check-outline">
        <HebrewText :text="$t('loadDoc.saved', { title: loaded.title, date: loaded.date })" />
        <template #append>
          <v-btn color="primary" variant="flat" append-icon="mdi-arrow-right" :to="loaded.to">
            {{ $t('loadDoc.open') }}
          </v-btn>
        </template>
      </v-alert>
    </template>
  </v-card>
</template>

<script setup lang="ts">
/**
 * « Charger un JSON corrigé » : lecture, validation minimale, vérification du texte,
 * puis enregistrement comme version locale (le fichier sur le disque ne change pas).
 * Utilisable hors d'un תוספות (catalogue) : ne dépend pas de useTosafot.
 */
import { ref, shallowRef } from 'vue'
import { refreshLocalCatalog } from '@/data/catalog'
import { checkIntegrity, type IntegrityReport } from '@/utils/integrity'
import { localSlug, saveLocalDoc } from '@/utils/localDocs'
import { parseTosafotJson } from '@/utils/validateDoc'
import HebrewText from '@/components/common/HebrewText.vue'
import IntegrityResult from '@/components/integrity/IntegrityResult.vue'

const props = withDefaults(defineProps<{ view?: string }>(), { view: 'review' })

const file = shallowRef<File | File[] | null>(null)
const busy = ref(false)
const errors = ref<string[]>([])
const loaded = shallowRef<{ report: IntegrityReport; title: string; date: string; to: object } | null>(null)

async function load(value: File | File[] | null | undefined) {
  const picked = Array.isArray(value) ? value[0] : value
  errors.value = []
  loaded.value = null
  if (!picked) return
  busy.value = true
  try {
    const result = parseTosafotJson(await picked.text())
    if (!result.ok) {
      errors.value = result.errors
      return
    }
    const report = checkIntegrity(result.doc)
    const info = await saveLocalDoc(result.doc)
    refreshLocalCatalog()
    loaded.value = {
      report,
      title: info.title,
      date: new Date(info.importedAt).toLocaleString(),
      to: { name: 'tosafot', params: { slug: localSlug(info.id), view: props.view } },
    }
  } catch (e) {
    errors.value = [e instanceof Error ? e.message : String(e)]
  } finally {
    busy.value = false
  }
}
</script>
