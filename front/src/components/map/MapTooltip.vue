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
      <template v-if="links.length">
        <div class="text-label-medium mt-2">{{ $t('map.links') }}</div>
        <ul class="map-tooltip__links text-body-small">
          <HebrewText v-for="(l, i) in links" :key="i" tag="li" :text="l" />
        </ul>
      </template>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
/** Infobulle Vuetify d'un nœud survolé : titre complet et résumé du niveau choisi. */
import { computed } from 'vue'
import HebrewText from '@/components/common/HebrewText.vue'
import { usePreferences } from '@/composables/usePreferences'
import { useTosafot } from '@/composables/useTosafot'
import { useI18n } from 'vue-i18n'
import { EDGE_STYLES } from '@/utils/argumentStyles'
import { pickLevel } from '@/utils/levels'

const props = defineProps<{ nodeId: string | null; target: Element | null }>()

const { node, doc } = useTosafot()
const { t } = useI18n()
const preferences = usePreferences()

const data = computed(() => (props.nodeId ? node(props.nodeId) : undefined))
const summary = computed(() => pickLevel(data.value?.summary, preferences.level))
const open = computed(() => Boolean(data.value && props.target))
// Les flèches ne sont pas atteignables au clavier : leur explication est reprise ici.
const links = computed(() =>
  doc.value.visualSummary.edges
    .filter((e) => e.from === props.nodeId && e.explanation)
    .map((e) =>
      t('map.linkItem', {
        to: e.to,
        type: t(EDGE_STYLES[e.type].labelKey).toLowerCase(),
        explanation: e.explanation,
      }),
    ),
)
</script>
<style scoped>
.map-tooltip__links {
  padding-inline-start: 1rem;
  line-height: 1.45;
}
</style>
