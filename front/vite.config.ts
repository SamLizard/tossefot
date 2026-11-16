import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  // Chemins relatifs : le site fonctionne sous /<repo>/ (GitHub Pages) comme à la racine.
  base: './',
  plugins: [vue(), vuetify({ autoImport: true })],
  define: {
    // Drapeaux de build de vue-i18n : API composition seule, sans avertissement en dev.
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Les fichiers JSON des תוספות restent dans /data, à la racine du projet.
      '@data': fileURLToPath(new URL('../data', import.meta.url)),
    },
  },
  server: {
    fs: { allow: ['..'] },
  },
  optimizeDeps: {
    // Voir le guide de migration Vuetify 4 : z-index des overlays en mode dev.
    include: [
      'vuetify/components/VOverlay',
      'vuetify/components/VDialog',
      'vuetify/components/VMenu',
      'vuetify/components/VSelect',
      'vuetify/components/VTooltip',
    ],
  },
})
