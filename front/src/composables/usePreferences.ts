/** Préférences utilisateur gardées en localStorage (docs/UI_SPEC.md §8). */
import { reactive, watch } from 'vue'
import type { LevelId } from '@/types/tosafot'

export type ViewId = 'context' | 'structure' | 'text' | 'map' | 'synthesis'
export type HebrewFont = 'serif' | 'rashi'
export type ThemeMode = 'light' | 'dark' | 'system'

export interface Preferences {
  level: LevelId
  view: ViewId
  roleColors: boolean
  showTranslation: boolean
  hebrewFont: HebrewFont
  /** Taille du texte en pourcentage (80-160). */
  textScale: number
  theme: ThemeMode
}

const STORAGE_KEY = 'tossefot.preferences.v1'

const DEFAULTS: Preferences = {
  level: 'standard',
  view: 'structure',
  roleColors: true,
  showTranslation: true,
  hebrewFont: 'serif',
  textScale: 100,
  theme: 'light',
}

function load(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

/** Singleton : un seul objet réactif partagé par toute l'application. */
const preferences = reactive<Preferences>(load())

watch(preferences, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), {
  deep: true,
})

export function usePreferences(): Preferences {
  return preferences
}

export function resetPreferences(): void {
  Object.assign(preferences, DEFAULTS)
}
