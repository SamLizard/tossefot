/**
 * Découpage du texte mixte français / hébreu (docs/UI_SPEC.md §2).
 *
 * Règles :
 * - une suite hébraïque = des mots hébreux séparés seulement par des espaces ;
 *   une virgule, un point-virgule, un guillemet français coupe la suite
 *   (« שומר חנם, רב יוסף » = deux suites, lues dans l'ordre français) ;
 * - le « . » ou « : » d'une référence de דף (נו:, כה., קמג:) reste dans la suite,
 *   pour s'afficher à gauche du mot comme dans la גמרא ;
 * - les parenthèses appariées à l'intérieur de l'hébreu restent dans la suite
 *   (« (בעל) הלכות גדולות ») ; les autres restent côté français ;
 * - un texte sans aucune lettre latine est entièrement hébreu.
 */

export interface TextPart {
  text: string
  he: boolean
}

/** Lettres, points, ״ ׳ ־ et formes de présentation. */
const HE_CHAR = /[\u0591-\u05F4\uFB1D-\uFB4F]/
const HE_LETTER = /[\u05D0-\u05EA\uFB1D-\uFB4F]/
const LATIN_LETTER = /[A-Za-zÀ-ÖØ-öø-ÿŒœ]/

export function containsHebrew(text: string): boolean {
  return HE_LETTER.test(text)
}

interface HeWord {
  lead: string
  core: string
  trail: string
}

export function splitHebrew(text: string): TextPart[] {
  if (!containsHebrew(text)) return [{ text, he: false }]
  if (!LATIN_LETTER.test(text)) return [{ text, he: true }]

  const pieces = text.match(/\s+|\S+/g) ?? []
  const parts: TextPart[] = []
  const pushFr = (t: string) => {
    if (!t) return
    const last = parts[parts.length - 1]
    if (last && !last.he) last.text += t
    else parts.push({ text: t, he: false })
  }

  for (let i = 0; i < pieces.length; ) {
    const first = asHebrewWord(pieces[i]!)
    if (!first) {
      pushFr(pieces[i]!)
      i++
      continue
    }
    // Étend la suite tant que : mot hébreu, espace, mot hébreu, sans ponctuation qui coupe.
    attachDafPunctuation(first, false)
    const group: { word: HeWord; space: string }[] = [{ word: first, space: '' }]
    let j = i
    for (;;) {
      const prev = group[group.length - 1]!.word
      const space = pieces[j + 1]
      const next = pieces[j + 2] !== undefined ? asHebrewWord(pieces[j + 2]!) : null
      if (!space || !/^\s+$/.test(space) || !next) break
      // Une parenthèse ouverte au milieu coupe la suite (« רש״י (נו:) ») ;
      // seule une parenthèse fermante qui referme une ouvrante du début est permise.
      if (next.lead) break
      if (prev.trail && !(prev.trail === ')' && group[0]!.word.lead.endsWith('('))) break
      attachDafPunctuation(next, true)
      group.push({ word: next, space })
      j += 2
    }
    emitGroup(group, pushFr, parts)
    i = j + 1
  }
  return parts
}

function emitGroup(
  group: { word: HeWord; space: string }[],
  pushFr: (t: string) => void,
  parts: TextPart[],
) {
  const last = group.length - 1
  let inner = group
    .map(({ word, space }, k) => space + (k > 0 ? word.lead : '') + word.core + (k < last ? word.trail : ''))
    .join('')
  let lead = group[0]!.word.lead
  let trail = group[last]!.word.trail
  // Parenthèse fermée dans l'hébreu → l'ouvrante aussi, et inversement.
  if (lead.endsWith('(') && count(inner, ')') > count(inner, '(')) {
    inner = '(' + inner
    lead = lead.slice(0, -1)
  }
  if (trail.startsWith(')') && count(inner, '(') > count(inner, ')')) {
    inner += ')'
    trail = trail.slice(1)
  }
  pushFr(lead)
  parts.push({ text: inner, he: true })
  pushFr(trail)
}

/** Sépare la ponctuation collée au mot ; null si le mot n'est pas hébreu. */
function asHebrewWord(piece: string): HeWord | null {
  if (!HE_LETTER.test(piece)) return null
  const chars = [...piece]
  const start = chars.findIndex((c) => HE_CHAR.test(c))
  let end = chars.length
  while (end > start && !HE_CHAR.test(chars[end - 1]!)) end--
  const word: HeWord = {
    lead: chars.slice(0, start).join(''),
    core: chars.slice(start, end).join(''),
    trail: chars.slice(end).join(''),
  }
  return word
}

/**
 * « נו: », « כה. » : la ponctuation du דף fait partie de la référence.
 * Seulement dans un contexte de référence (après un autre mot hébreu, entre
 * parenthèses, ou dans une plage « נה:-נו. »), pour ne pas avaler le point
 * final de « … comme רבא. ».
 */
function attachDafPunctuation(word: HeWord, afterHebrew: boolean): void {
  if (!/^[.:]/.test(word.trail) || /[״׳]/.test(word.core) || !isDafNumber(word.core)) return
  if (!afterHebrew && !word.lead.includes('(') && !word.core.includes('-')) return
  word.core += word.trail[0]
  word.trail = word.trail.slice(1)
}

const GEMATRIA: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 10, כ: 20, ל: 30, מ: 40, נ: 50, ס: 60, ע: 70, פ: 80, צ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400,
}

/** Numéro de דף en lettres (1 à 3 lettres, valeurs décroissantes ; טו et טז). */
export function isDafNumber(core: string): boolean {
  const word = core.split(/[^\u05D0-\u05EA״׳]/).pop()!.replace(/[״׳]/g, '')
  if (word.length < 1 || word.length > 3) return false
  if (word === 'טו' || word === 'טז') return true
  const values = [...word].map((c) => GEMATRIA[c])
  return values.every((v, k) => v !== undefined && (k === 0 || v < values[k - 1]!))
}

function count(text: string, char: string): number {
  return text.split(char).length - 1
}
