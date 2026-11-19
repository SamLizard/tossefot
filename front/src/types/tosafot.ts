/** Types du fichier JSON d'un תוספות (voir docs/UI_SPEC.md §10). */

export type LevelId = 'essentiel' | 'standard' | 'approfondi'
export const LEVELS: readonly LevelId[] = ['essentiel', 'standard', 'approfondi'] as const

/** Texte par niveau ; certains niveaux peuvent manquer ou être vides. */
export type Leveled = Partial<Record<LevelId, string>>

export interface LevelDef {
  id: LevelId
  label: string
  description: string
}

export interface RoleDef {
  id: string
  label: string
  color: string
}

export interface AttributionDef {
  id: string
  label: string
}

export interface Meta {
  id: string
  schemaVersion: string
  language: string
  title: string
  masechet: string
  daf: string
  perek: string
  dibburHamatchil: string
  levels: LevelDef[]
  roles: RoleDef[]
  attributions: AttributionDef[]
  methodology: Leveled
  /** Version du fichier (date ou numéro), pour savoir quelle version a été relue. */
  version?: string
  previousVersion?: string
}

/** Réponse de l'IA à une remarque de relecture (docs/JSON_IDEAS.md §4). */
export interface ReviewLogEntry {
  commentId: string
  status: 'corrigé' | 'discuté' | 'refusé'
  change?: string
  answer?: string
  targets?: string[]
}

export interface GemaraPassage {
  ref: string
  sourceId?: string
  text: string
  translation: string
}

export interface Context {
  title: string
  levels: Leveled
  gemara: GemaraPassage[]
  tableIds: string[]
}

export interface SourceText {
  ref: string
  sefariaUrl: string
  edition?: string
  normalization: string
  tokenization: string
  fullText: string
}

export interface PersonDates {
  from?: number
  to?: number
  approx?: boolean
}

export interface PersonLinks {
  wikipedia_he?: string
  wikipedia_fr?: string
  sefaria?: string
}

/** Nom proche avec lequel on confond souvent la personne (ex. רבא pour רבה). */
export interface PersonConfusion {
  he: string
  note: string
}

export interface Person {
  id: string
  name: string
  full?: string
  type: string
  description: string
  summary?: Leveled
  /** Époque, ex. « אמוראי בבל, דור שלישי ». */
  era?: string
  places?: string[]
  /** Formes du nom dans le texte. */
  aliases?: string[]
  confusions?: PersonConfusion[]
  dates?: PersonDates
  /** Ids d'autres personnes de `people`. */
  teachers?: string[]
  students?: string[]
  colleagues?: string[]
  /** URLs vérifiées par le générateur : ne pas en construire d'autres. */
  links?: PersonLinks
  /** Segments où la personne apparaît. */
  segmentIds?: string[]
}

export interface StructureNode {
  id: string
  number: string
  title: string
  role: string
  summary: Leveled
  segmentIds: string[]
  children?: StructureNode[]
  conclusion?: string
}

export interface StructureCorrections {
  title: string
  items: { section: string; change: string }[]
}

export interface Term {
  he: string
  fr: string
  note?: string
}

export interface Segment {
  id: string
  nodeId: string
  role: string
  attribution: string
  he: string
  translation: string
  explanation: Leveled
  terms: Term[]
  notes?: string[]
  sourceIds: string[]
  tableIds?: string[]
  /** Personnes citées dans le segment (ids de `people`). */
  peopleIds?: string[]
  /** Termes du glossaire présents dans l'explication (ids de `glossary`). */
  glossaryRefs?: string[]
}

export interface DataTable {
  id: string
  title: string
  columns: string[]
  rows: string[][]
  note?: string
}

export interface Source {
  id: string
  ref: string
  sefaria: string
  url: string
  role?: string
  consulted: boolean
  /** Phrase de la source citée par le תוספות. */
  quote?: SourceQuote
  location?: SourceLocation
}

export interface SourceQuote {
  he: string
  fr: string
  /** Référence Sefaria de la citation, ex. « Bava Kamma 56b:10 ». */
  ref: string
}

export interface SourceLocation {
  sefariaRef: string
  /** Libellé affichable, ex. « בבא קמא נו: · Sefaria 9-11 ». */
  label: string
  url?: string
}

export interface Abbreviation {
  he: string
  full: string
  warning?: string
  /** Forme développée propre à un segment (abréviation ambiguë, ex. ר״א). */
  bySegment?: Record<string, string>
}

export interface GlossaryEntry {
  id: string
  he: string
  fr: string
}

export interface ReviewQuestion {
  q: string
  a: string
  /** Segments où se trouve la réponse. */
  segmentIds?: string[]
}

export interface Synthesis {
  takeaways: string[]
  halacha: Leveled
  review: ReviewQuestion[]
  nextPreview: string
}

export type EdgeType = 'prouve' | 'rejette' | 'objecte' | 'répond' | 'fonde'

export interface Edge {
  from: string
  to: string
  type: EdgeType
  label?: string
  /** Pourquoi cette flèche (affichable au survol). */
  explanation?: string
}

export interface VisualSummary {
  recommended: string
  why: string
  edges: Edge[]
}

export interface TosafotDoc {
  meta: Meta
  context: Context
  source: SourceText
  people: Person[]
  structure: StructureNode[]
  structureCorrections?: StructureCorrections
  segments: Segment[]
  tables: DataTable[]
  sources: Source[]
  abbreviations: Abbreviation[]
  glossary: GlossaryEntry[]
  synthesis: Synthesis
  visualSummary: VisualSummary
  reviewLog?: ReviewLogEntry[]
}
