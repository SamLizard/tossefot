<template>
  <p lang="he" dir="rtl" class="he-block he-tosafot"><template v-for="(t, i) in tokens" :key="i"><TermTooltip
        v-if="t.kind === 'term'"
        :term="t.term"
        :abbrs="t.abbrs"
        >{{ t.text }}</TermTooltip
      ><AbbrTooltip
        v-else-if="t.kind === 'abbr'"
        :full="t.abbr.full"
        :warning="t.abbr.warning"
        >{{ t.text }}</AbbrTooltip
      ><template v-else>{{ t.text }}</template></template></p>
</template>

<script setup lang="ts">
/**
 * Texte hébreu d'un segment (RTL), avec infobulles sur les abréviations et les termes.
 * Les espaces d'origine sont conservés : le texte affiché est exactement `segment.he`.
 */
import { computed } from 'vue'
import { useTosafot } from '@/composables/useTosafot'
import { abbrIndexFor, tokenizeSegment } from '@/utils/segmentTokens'
import AbbrTooltip from '@/components/segment/AbbrTooltip.vue'
import TermTooltip from '@/components/segment/TermTooltip.vue'

const props = defineProps<{ segmentId: string }>()

const { doc, segment } = useTosafot()

const tokens = computed(() => {
  const s = segment(props.segmentId)
  if (!s) return []
  return tokenizeSegment(s.he, s.terms, abbrIndexFor(doc.value.abbreviations), s.id)
})
</script>
