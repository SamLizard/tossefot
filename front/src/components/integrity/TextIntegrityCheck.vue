<template>
  <v-btn
    v-if="compact"
    icon="mdi-text-box-check-outline"
    variant="text"
    :aria-label="$t('integrity.check')"
    @click="start"
  />
  <v-btn v-else variant="text" prepend-icon="mdi-text-box-check-outline" @click="start">
    {{ $t('integrity.check') }}
  </v-btn>

  <v-dialog v-model="open" max-width="720" scrollable>
    <v-card variant="flat">
      <v-card-title class="d-flex align-center ga-2 pt-4">
        <v-icon icon="mdi-text-box-check-outline" color="primary" />
        <span class="text-title-large">{{ $t('integrity.check') }}</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" :aria-label="$t('common.close')" @click="open = false" />
      </v-card-title>
      <v-card-subtitle class="text-wrap">
        <HebrewText :text="$t('integrity.intro')" />
      </v-card-subtitle>

      <v-card-text>
        <IntegrityResult v-if="report" :report="report" @select="select" />
        <v-divider class="my-4" />
        <SefariaCompare :state="sefaria" :url="sefariaUrl()" @run="runSefaria" />
      </v-card-text>

      <v-card-actions>
        <v-btn prepend-icon="mdi-refresh" @click="runLocal">{{ $t('integrity.rerun') }}</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="open = false">{{ $t('common.close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
/** Bouton « Vérifier le texte » (docs/UI_SPEC.md §7) : dialogue avec le résultat. */
import { ref } from 'vue'
import { useIntegrity } from '@/composables/useIntegrity'
import { useSegmentPanel } from '@/composables/useSegmentPanel'
import { useViewNavigation } from '@/composables/useViewNavigation'
import HebrewText from '@/components/common/HebrewText.vue'
import IntegrityResult from './IntegrityResult.vue'
import SefariaCompare from './SefariaCompare.vue'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const open = ref(false)
const { report, sefaria, runLocal, runSefaria, sefariaUrl } = useIntegrity()
const { scrollToSegment } = useSegmentPanel()
const { goTo } = useViewNavigation()

function start() {
  runLocal()
  open.value = true
}

async function select(segmentId: string) {
  open.value = false
  await goTo('text')
  await scrollToSegment(segmentId)
}
</script>
