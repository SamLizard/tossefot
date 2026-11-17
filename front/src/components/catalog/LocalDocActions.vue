<template>
  <v-chip size="small" color="secondary" variant="tonal" label prepend-icon="mdi-laptop" class="ms-2">
    {{ $t('localDocs.label', { date: new Date(info.importedAt).toLocaleString() }) }}
  </v-chip>
  <v-btn
    icon="mdi-delete-outline"
    size="small"
    variant="text"
    color="error"
    :aria-label="$t('localDocs.delete')"
    @click.prevent.stop="confirm = true"
  />

  <v-dialog v-model="confirm" max-width="420">
    <v-card :title="$t('localDocs.deleteTitle')" :text="$t('localDocs.deleteConfirm')">
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="confirm = false">{{ $t('reviewing.cancel') }}</v-btn>
        <v-btn color="error" variant="flat" @click="remove">{{ $t('localDocs.delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
/** Badge « version locale » et suppression de la version locale (le fichier de /data reste). */
import { ref } from 'vue'
import { refreshLocalCatalog } from '@/data/catalog'
import { deleteLocalDoc, type LocalDocInfo } from '@/utils/localDocs'

const props = defineProps<{ info: LocalDocInfo }>()
const confirm = ref(false)

async function remove() {
  confirm.value = false
  await deleteLocalDoc(props.info.id)
  refreshLocalCatalog()
}
</script>
