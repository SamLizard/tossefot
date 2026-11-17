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

export interface Person {
  id: string
  name: string
  full?: string
  type: string
  description: string
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
}

export interface Abbreviation {
  he: string
  full: string
  warning?: string
}

export interface GlossaryEntry {
  he: string
  fr: string
}

export interface ReviewQuestion {
  q: string
  a: string
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
