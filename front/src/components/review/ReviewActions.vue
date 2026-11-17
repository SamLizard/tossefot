<template>
  <v-card variant="outlined" class="pa-4 d-flex flex-column ga-3">
    <div class="text-title-medium">{{ $t('reviewing.sendTitle') }}</div>
    <HebrewText :text="$t('reviewing.sendIntro')" tag="p" class="text-body-medium text-medium-emphasis" />
    <div class="d-flex flex-wrap ga-2">
      <v-btn color="primary" variant="flat" prepend-icon="mdi-content-copy" :disabled="!total" @click="copyPrompt">
        {{ $t('reviewing.copyPrompt') }}
      </v-btn>
      <v-btn variant="tonal" prepend-icon="mdi-text-box-outline" :disabled="!total" @click="downloadPrompt">
        {{ $t('reviewing.downloadPrompt') }}
      </v-btn>
      <v-btn variant="tonal" prepend-icon="mdi-code-json" @click="downloadCurrentJson">
        {{ $t('reviewing.downloadJson') }}
      </v-btn>
      <v-btn variant="tonal" prepend-icon="mdi-download-outline" :disabled="!total" @click="exportFile">
        {{ $t('reviewing.export') }}
      </v-btn>
    </div>
    <v-alert type="info" variant="tonal" density="compact" icon="mdi-paperclip">
      <HebrewText :text="$t('reviewing.attachJson', { file: `${docId}.json` })" />
    </v-alert>

    <v-divider />
    <div class="d-flex flex-wrap align-center ga-3">
      <v-file-input
        v-model="importPicked"
        accept=".json,application/json"
        :label="$t('reviewing.import')"
        prepend-icon="mdi-file-import-outline"
        density="compact"
        hide-details
        class="import-input"
        @update:model-value="importComments"
      />
      <v-btn variant="text" color="error" prepend-icon="mdi-delete-sweep-outline" :disabled="!total" @click="confirmClear = true">
        {{ $t('reviewing.clear') }}
      </v-btn>
    </div>

    <v-dialog v-model="confirmClear" max-width="420">
      <v-card :title="$t('reviewing.clearTitle')" :text="$t('reviewing.clearConfirm', { count: total })">
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmClear = false">{{ $t('reviewing.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" @click="doClear">{{ $t('reviewing.clear') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500">{{ snackbar.text }}</v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
/** Envoi des remarques à l'IA : prompt (copie / fichier), export, import, effacement. */
import { computed, reactive, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTosafot } from '@/composables/useTosafot'
import { useReview } from '@/composables/useReview'
import { downloadText } from '@/utils/download'
import HebrewText from '@/components/common/HebrewText.vue'

const { t } = useI18n()
const { doc } = useTosafot()
const { counts, prompt, markSent, exportFile, importFile, clear, downloadCurrentJson } = useReview()

const docId = computed(() => doc.value.meta.id)
const total = computed(() => counts.value.total)
const confirmClear = ref(false)
const importPicked = shallowRef<File | File[] | null>(null)
const snackbar = reactive({ show: false, text: '', color: 'success' })

function notify(text: string, color = 'success') {
  Object.assign(snackbar, { show: true, text, color })
}

async function copyPrompt() {
  const text = prompt()
  try {
    await navigator.clipboard.writeText(text)
    markSent()
    notify(t('reviewing.promptCopied'))
  } catch {
    notify(t('reviewing.promptCopyFailed'), 'error')
  }
}

function downloadPrompt() {
  downloadText(`${docId.value}.prompt.txt`, prompt(), 'text/plain')
  markSent()
}

async function importComments(value: File | File[] | null | undefined) {
  const picked = Array.isArray(value) ? value[0] : value
  if (!picked) return
  try {
    notify(t('reviewing.imported', { count: await importFile(picked) }))
  } catch (e) {
    notify(e instanceof Error ? e.message : String(e), 'error')
  } finally {
    importPicked.value = null
  }
}

function doClear() {
  clear()
  confirmClear.value = false
}
</script>

<style scoped>
.import-input {
  min-width: 260px;
  flex: 1 1 260px;
}
</style>
