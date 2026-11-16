/**
 * Configuration de vue-i18n. Une seule langue pour l'instant (français) ;
 * pour en ajouter une : créer `locales/<code>.json` et l'enregistrer dans `messages`.
 * Les messages de Vuetify (`$vuetify`) sont fusionnés ici : Vuetify lit ses textes
 * (« Aucune donnée », aria-labels…) dans le même i18n, via l'adaptateur de plugins/vuetify.ts.
 */
import { createI18n } from 'vue-i18n'
import { fr as vuetifyFr } from 'vuetify/locale'
import fr from './locales/fr.json'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: {
    fr: { ...fr, $vuetify: vuetifyFr },
  },
})

export default i18n

/** Traduction hors composant (utils, composables) ; dans un composant, préférer `$t` / `useI18n()`. */
export const t = i18n.global.t
