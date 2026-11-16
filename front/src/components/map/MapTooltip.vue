<script setup lang="ts">
/** Infobulle Vuetify d'un nœud survolé : titre complet et résumé du niveau choisi. */
import { computed } from 'vue'
import HebrewText from '@/components/common/HebrewText.vue'
import { usePreferences } from '@/composables/usePreferences'
import { useTosafot } from '@/composables/useTosafot'
import { pickLevel } from '@/utils/levels'

const props = defineProps<{ nodeId: string | null; target: Element | null }>()

const { node } = useTosafot()
const preferences = usePreferences()

const data = computed(() => (props.nodeId ? node(props.nodeId) : undefined))
const summary = computed(() => pickLevel(data.value?.summary, preferences.level))
const open = computed(() => Boolean(data.value && props.target))
</script>

<template>
  <v-tooltip
    :model-value="open"
    :target="target ?? undefined"
    location="bottom"
    :open-on-hover="false"
    :open-on-focus="false"
    :max-width="380"
  >
    <template v-if="data">
      <div class="text-label-large mb-1">
        {{ data.number }}. <HebrewText :text="data.title" />
      </div>
      <HebrewText v-if="summary" tag="div" class="text-body-small" :text="summary" />
      <div v-if="data.conclusion" class="text-body-small mt-1 font-weight-medium">
        ⇒ <HebrewText :text="data.conclusion" />
      </div>
    </template>
  </v-tooltip>
</template>
