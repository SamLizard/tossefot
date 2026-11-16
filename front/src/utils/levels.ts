import { LEVELS, type Leveled, type LevelId } from '@/types/tosafot'

/** Vrai si le niveau existe et n'est pas vide. */
export function hasLevel(text: Leveled | undefined, level: LevelId): boolean {
  return Boolean(text?.[level]?.trim())
}

/**
 * Texte du niveau demandé ; s'il manque, le niveau inférieur le plus proche
 * (approfondi → standard → essentiel). Chaîne vide si rien n'existe.
 */
export function pickLevel(text: Leveled | undefined, level: LevelId): string {
  if (!text) return ''
  for (let i = LEVELS.indexOf(level); i >= 0; i--) {
    const value = text[LEVELS[i]!]?.trim()
    if (value) return value
  }
  return ''
}
