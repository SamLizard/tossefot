<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useTheme } from 'vuetify'
import { usePreferences } from '@/composables/usePreferences'

const preferences = usePreferences()
const theme = useTheme()
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

const themeName = computed(() => {
  if (preferences.theme === 'system') return prefersDark.matches ? 'night' : 'parchment'
  return preferences.theme === 'dark' ? 'night' : 'parchment'
})

watchEffect(() => theme.change(themeName.value))

watchEffect(() => {
  const root = document.documentElement.style
  root.setProperty('--text-scale', String(preferences.textScale / 100))
  root.setProperty(
    '--he-font-text',
    preferences.hebrewFont === 'rashi' ? 'var(--he-font-rashi)' : 'var(--he-font-serif)',
  )
})
</script>
