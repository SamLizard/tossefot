<template>
  <!-- Déjà dans le v-container de 960 px de TosafotReader. -->
  <div class="structure-tree">
    <div class="d-flex flex-wrap align-center ga-2 mb-4">
      <v-btn
        variant="tonal"
        color="primary"
        :prepend-icon="allOpen ? 'mdi-unfold-less-horizontal' : 'mdi-unfold-more-horizontal'"
        @click="allOpen ? closeAll() : openAll()"
      >
        {{ allOpen ? $t('structure.collapseAll') : $t('structure.expandAll') }}
      </v-btn>
      <v-spacer />
      <v-btn variant="text" prepend-icon="mdi-link-variant" @click="copyLink">
        {{ $t('structure.copyLink') }}
      </v-btn>
    </div>

    <div class="d-flex flex-column ga-4">
      <StructureNode v-for="n in doc.structure" :key="n.id" :node-id="n.id" :depth="0" />
    </div>

    <v-snackbar v-model="snackbar" :timeout="2500" location="bottom">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
/** Vue « Structure » (docs/UI_SPEC.md §3.1) : arbre repliable, état dans l'URL. */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTosafot } from '@/composables/useTosafot'
import { useOpenNodes } from '@/composables/useOpenNodes'
import StructureNode from './StructureNode.vue'

const { t } = useI18n()
const { doc } = useTosafot()
const { allOpen, openAll, closeAll } = useOpenNodes()

const snackbar = ref(false)
const snackbarText = ref('')

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    snackbarText.value = t('structure.linkCopied')
  } catch {
    snackbarText.value = t('structure.linkCopyFailed')
  }
  snackbar.value = true
}
</script>
