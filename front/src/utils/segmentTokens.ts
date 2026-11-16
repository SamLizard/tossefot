/**
 * Découpage du texte hébreu d'un segment en morceaux affichables (docs/UI_SPEC.md §4 et §6) :
 * espaces d'origine, mots simples, abréviations et termes (suites de mots).
 */
import type { Abbreviation, Term } from '@/types/tosafot'
import { buildAbbrIndex, findAbbreviation, findTerms, type AbbrMatch } from '@/utils/abbreviations'

export interface AbbrInTerm extends AbbrMatch {
  word: string
}

export type HeToken =
  | { kind: 'text'; text: string }
  | { kind: 'abbr'; text: string; abbr: AbbrMatch }
  | { kind: 'term'; text: string; term: Term; abbrs: AbbrInTerm[] }

/** Un seul index par liste d'abréviations (partagé par toutes les cartes). */
const indexCache = new WeakMap<Abbreviation[], Map<string, Abbreviation>>()

export function abbrIndexFor(list: Abbreviation[]): Map<string, Abbreviation> {
  let index = indexCache.get(list)
  if (!index) {
    index = buildAbbrIndex(list)
    indexCache.set(list, index)
  }
  return index
}

/**
 * Les espaces sont gardés tels quels pour que le texte affiché soit identique au JSON.
 * Un terme englobe les espaces entre ses mots ; les abréviations qu'il contient
 * sont renvoyées avec lui (pas d'infobulles imbriquées).
 */
export function tokenizeSegment(
  he: string,
  terms: Term[],
  index: Map<string, Abbreviation>,
  segmentId: string,
): HeToken[] {
  const pieces = he.match(/\S+|\s+/g) ?? []
  const wordPos: number[] = []
  pieces.forEach((p, i) => {
    if (/\S/.test(p)) wordPos.push(i)
  })
  const words = wordPos.map((i) => pieces[i]!)
  const spanAt = new Map(findTerms(words, terms).map((s) => [s.start, s]))

  const out: HeToken[] = []
  let w = 0
  for (let i = 0; i < pieces.length; ) {
    const piece = pieces[i]!
    if (!/\S/.test(piece)) {
      out.push({ kind: 'text', text: piece })
      i++
      continue
    }
    const span = spanAt.get(w)
    if (span) {
      const last = wordPos[span.end - 1]!
      const abbrs = words.slice(span.start, span.end).flatMap((word) => {
        const match = findAbbreviation(word, index, segmentId)
        return match ? [{ word, ...match }] : []
      })
      out.push({ kind: 'term', text: pieces.slice(i, last + 1).join(''), term: span.term, abbrs })
      i = last + 1
      w = span.end
      continue
    }
    const abbr = findAbbreviation(piece, index, segmentId)
    out.push(abbr ? { kind: 'abbr', text: piece, abbr } : { kind: 'text', text: piece })
    i++
    w++
  }
  return mergeText(out)
}

/** Regroupe les morceaux de texte simple consécutifs (moins de nœuds DOM). */
function mergeText(tokens: HeToken[]): HeToken[] {
  const out: HeToken[] = []
  for (const t of tokens) {
    const prev = out[out.length - 1]
    if (t.kind === 'text' && prev?.kind === 'text') prev.text += t.text
    else out.push(t)
  }
  return out
}
