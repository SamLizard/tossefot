/** Abréviations et termes dans le texte hébreu (docs/UI_SPEC.md §4 et §6). */
import type { Abbreviation, Term } from '@/types/tosafot'

export interface AbbrMatch {
  full: string
  warning?: string
}

/** Cas ambigu « ר״א » : la forme dépend du segment. */
const SEGMENT_OVERRIDES: Record<string, Record<string, string>> = {
  'ר״א': { s15: 'רבי אלעזר', s34: 'רבי אליעזר', s35: 'רבי אליעזר', s37: 'רבי אליעזר' },
}

const PREFIXES = ['ו', 'ד', 'כ', 'ל', 'ב', 'מ', 'ה', 'ש']
const PUNCTUATION = /^[(\[]+|[).,:;\]]+$/g

/** Index : forme abrégée → définition. « ה״ג / בה״ג » donne deux entrées. */
export function buildAbbrIndex(list: Abbreviation[]): Map<string, Abbreviation> {
  const index = new Map<string, Abbreviation>()
  for (const abbr of list) {
    for (const form of abbr.he.split('/').map((f) => f.trim())) index.set(form, abbr)
  }
  return index
}

/**
 * Cherche l'abréviation d'un mot (avec ponctuation et préfixes ו ד כ ל ב מ ה ש).
 * Renvoie undefined si le mot ne contient pas ״ / ׳ ou n'est pas dans la liste.
 */
export function findAbbreviation(
  word: string,
  index: Map<string, Abbreviation>,
  segmentId?: string,
): AbbrMatch | undefined {
  const clean = word.replace(PUNCTUATION, '')
  if (!/[״׳]/.test(clean)) return undefined
  for (const candidate of withoutPrefixes(clean)) {
    const abbr = index.get(candidate)
    if (!abbr) continue
    const override = segmentId ? SEGMENT_OVERRIDES[candidate]?.[segmentId] : undefined
    return { full: override ?? abbr.full, warning: abbr.warning }
  }
  return undefined
}

function withoutPrefixes(word: string): string[] {
  const out = [word]
  let rest = word
  while (rest.length > 2 && PREFIXES.includes(rest[0]!)) {
    rest = rest.slice(1)
    out.push(rest)
  }
  return out
}

export interface TermSpan {
  start: number
  end: number
  term: Term
}

/**
 * Positions (en mots) des termes trouvés dans la liste de mots.
 * Les termes les plus longs gagnent ; pas de chevauchement.
 */
export function findTerms(words: string[], terms: Term[]): TermSpan[] {
  const clean = words.map((w) => w.replace(PUNCTUATION, ''))
  const sorted = terms
    .map((term) => ({ term, parts: term.he.replace(/־$/, '').split(' ') }))
    .sort((a, b) => b.parts.length - a.parts.length)
  const used = new Array<boolean>(words.length).fill(false)
  const spans: TermSpan[] = []
  for (const { term, parts } of sorted) {
    // D'abord la forme exacte, puis avec préfixes sur le premier mot (« דפרוטה » pour « פרוטה »).
    for (const allowPrefix of [false, true]) {
      const i = findSpan(clean, used, parts, term.he.endsWith('־'), allowPrefix)
      if (i < 0) continue
      for (let k = i; k < i + parts.length; k++) used[k] = true
      spans.push({ start: i, end: i + parts.length, term })
      break
    }
  }
  return spans.sort((a, b) => a.start - b.start)
}

function findSpan(
  clean: string[],
  used: boolean[],
  parts: string[],
  openEnd: boolean,
  allowPrefix: boolean,
): number {
  for (let i = 0; i + parts.length <= clean.length; i++) {
    if (parts.some((_, k) => used[i + k])) continue
    const matches = parts.every((p, k) => {
      const word = clean[i + k]!
      if (k === parts.length - 1 && openEnd) {
        return k === 0 && allowPrefix ? withoutPrefixes(word).some((w) => w.startsWith(p)) : word.startsWith(p)
      }
      return k === 0 && allowPrefix ? withoutPrefixes(word).slice(1, 3).includes(p) : word === p
    })
    if (matches) return i
  }
  return -1
}
