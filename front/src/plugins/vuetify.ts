import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { useI18n } from 'vue-i18n'
import i18n from '@/i18n'

/*
 * Chaque couleur de fond a sa couleur de texte « on-… » explicite :
 * Vuetify ne la calcule pas toujours bien pour les couleurs personnalisées
 * (texte blanc sur beige dans les infobulles, par exemple).
 */

/** Parchemin clair : rappelle la page imprimée de la Guemara. */
const parchment: ThemeDefinition = {
  dark: false,
  // Texte secondaire plus foncé que la valeur par défaut (0.7) : lisible sur le beige.
  variables: { 'medium-emphasis-opacity': 0.8 },
  colors: {
    background: '#f7f3ea',
    'on-background': '#1f2328',
    surface: '#fffdf8',
    'on-surface': '#1f2328',
    'surface-variant': '#e9e1cf',
    'on-surface-variant': '#2b2416',
    primary: '#1e3a5f',
    'on-primary': '#ffffff',
    secondary: '#7a5f30',
    'on-secondary': '#ffffff',
    accent: '#b45309',
    'on-accent': '#ffffff',
    success: '#15803d',
    'on-success': '#ffffff',
    error: '#b91c1c',
    'on-error': '#ffffff',
    warning: '#b45309',
    'on-warning': '#ffffff',
    info: '#0e7490',
    'on-info': '#ffffff',
    'note-bg': '#fdf6d8',
    'on-note-bg': '#3d3206',
  },
}

/** Nuit : fond ardoise, textes clairs, couleurs d'accent éclaircies. */
const night: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#14171c',
    'on-background': '#e6e8eb',
    surface: '#1c2027',
    'on-surface': '#e6e8eb',
    'surface-variant': '#323946',
    'on-surface-variant': '#eef0f3',
    primary: '#9cc2f0',
    'on-primary': '#0d1b2a',
    secondary: '#d6b77a',
    'on-secondary': '#231a08',
    accent: '#f59e0b',
    'on-accent': '#1f1300',
    success: '#4ade80',
    'on-success': '#052e14',
    error: '#f87171',
    'on-error': '#2b0606',
    warning: '#fbbf24',
    'on-warning': '#261a00',
    info: '#67e8f9',
    'on-info': '#032a30',
    'note-bg': '#3a3420',
    'on-note-bg': '#f5ecc8',
  },
}

export default createVuetify({
  // Vuetify partage l'instance vue-i18n de l'application (voir src/i18n/index.ts).
  locale: { adapter: createVueI18nAdapter({ i18n, useI18n }) },
  theme: {
    defaultTheme: 'parchment',
    themes: { parchment, night },
  },
  defaults: {
    VCard: { rounded: 'lg' },
    VBtn: { rounded: 'lg' },
    VChip: { rounded: 'lg' },
    VTooltip: { maxWidth: 420, location: 'top' },
  },
})
