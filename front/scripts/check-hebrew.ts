// Vérifie le découpage hébreu / français sur des cas réels. Usage : node scripts/check-hebrew.ts
import { readFileSync } from 'node:fs'
import { splitHebrew } from '../src/utils/hebrew.ts'

const show = (t: string) =>
  splitHebrew(t)
    .map((p) => (p.he ? `[${p.text}]` : p.text))
    .join('')

const cases: [string, string][] = [
  [
    'La Guemara discute du gardien d\'un objet trouvé : רבה dit qu\'il est שומר חנם, רב יוסף qu\'il est שומר שכר grâce',
    'La Guemara discute du gardien d\'un objet trouvé : [רבה] dit qu\'il est [שומר חנם], [רב יוסף] qu\'il est [שומר שכר] grâce',
  ],
  ['règle générale (ב״ב קמג:, גיטין עד:), רב נחמן contre', 'règle générale ([ב״ב קמג:], [גיטין עד:]), [רב נחמן] contre'],
  // Sans lettre latine : bloc entièrement hébreu.
  ['(בעל) הלכות גדולות', '[(בעל) הלכות גדולות]'],
  // Une plage de דפים reste une seule référence, lue de droite à gauche.
  ['La משנה (נה:-נו.) traite', 'La [משנה] ([נה:-נו.]) traite'],
  ['ב״מ פא:-פב: et', '[ב״מ פא:-פב:] et'],
  ['selon ר׳ טרפון (« ישתמש »)', 'selon [ר׳ טרפון] (« [ישתמש] »)'],
  ['La Guemara (נו:) fait une digression', 'La Guemara ([נו:]) fait une digression'],
  ['(« ואספתו אל תוך ביתך »). Pour רבה, il', '(« [ואספתו אל תוך ביתך] »). Pour [רבה], il'],
  ['le פסוק de סוכה, une סברא', 'le [פסוק] de [סוכה], une [סברא]'],
  ['רש״י (נו:) se contente', '[רש״י] ([נו:]) se contente'],
  ['Comme רבה : ר״י et le רא״ש.', 'Comme [רבה] : [ר״י] et le [רא״ש].'],
  ['Le תוספות écrit « ה״ג ».', 'Le [תוספות] écrit « [ה״ג] ».'],
  // Point final de phrase : reste en français, même après un nom court.
  ['Il suit רבא.', 'Il suit [רבא].'],
  ['comme ר״י.', 'comme [ר״י].'],
  ['voir סוכה כה.', 'voir [סוכה כה.]'],
  ['(1) Règle générale : הלכה כרבה contre', '(1) Règle générale : [הלכה כרבה] contre'],
  ['« (בעל) הלכות גדולות » est', '« [(בעל) הלכות גדולות] » est'],
]

let failures = 0
for (const [input, expected] of cases) {
  const got = show(input)
  const ok = got === expected
  if (!ok) failures++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${got}${ok ? '' : `\n     attendu : ${expected}`}`)
}

// Aucun texte ne doit perdre ou gagner un caractère.
const data = JSON.parse(readFileSync('../data/bk56b_tosafot_behahi_hanaa.json', 'utf8'))
const strings: string[] = []
const walk = (v: unknown) => {
  if (typeof v === 'string') strings.push(v)
  else if (v && typeof v === 'object') Object.values(v).forEach(walk)
}
walk(data)
const lost = strings.filter((s) => splitHebrew(s).map((p) => p.text).join('') !== s)
console.log(`${lost.length ? 'FAIL' : 'OK  '} ${strings.length} textes du JSON reconstitués à l'identique (${lost.length} écarts)`)
process.exit(failures || lost.length ? 1 : 0)
