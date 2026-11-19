/**
 * Disposition de la carte d'arguments (docs/UI_SPEC.md §3.3).
 * Chaque grande partie (I, II, III…) est disposée par dagre (de haut en bas, ordre
 * du texte), puis les parties sont empilées. Les flèches entre deux parties passent
 * par un couloir à gauche, sans traverser de nœud. Fonctions pures, sans Vue.
 */
import { Graph, layout, type EdgeLabel, type GraphLabel, type NodeLabel } from '@dagrejs/dagre'
import type { EdgeType, Segment, StructureNode, TosafotDoc } from '@/types/tosafot'
import { midpoint, roundedPath, smoothPath, type Point } from './argumentGeometry'

export type { Point } from './argumentGeometry'

/** `hierarchie` : lien parent → enfant ajouté pour un nœud sans aucune flèche. */
export type MapEdgeType = EdgeType | 'hierarchie'

export interface Box {
  id: string
  /** Centre. */
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutEdge {
  id: string
  from: string
  to: string
  type: MapEdgeType
  label?: string
  /** Pourquoi cette flèche (JSON), affiché au survol. */
  explanation?: string
  /** Attribut `d` du chemin SVG. */
  path: string
  /** Milieu de la flèche et direction (degrés) : croix de « rejette ». */
  mid: Point
  angle: number
  /** Centre de l'étiquette, si `label`. */
  labelPos?: Point
}

export interface ArgumentLayout {
  nodes: Box[]
  /** Bandes de fond, une par grande partie. */
  sections: Box[]
  edges: LayoutEdge[]
  width: number
  height: number
}

export const NODE_WIDTH = 232
export const NODE_HEIGHT = 96
export const LABEL_WIDTH = 160
export const LABEL_HEIGHT = 24
const RANK_SEP = 56
const SECTION_GAP = 56
const SECTION_PAD = 20
const LANE_SEP = 16
/** Laisse la place au numéro de la première partie, au-dessus de sa bande. */
const MARGIN = 40

interface RawEdge {
  from: string
  to: string
  type: MapEdgeType
  label?: string
  explanation?: string
}

function subtree(node: StructureNode): StructureNode[] {
  return [node, ...(node.children ?? []).flatMap(subtree)]
}

/** Flèches du JSON, plus un lien hiérarchique pour chaque nœud qui n'en a aucune. */
export function collectEdges(doc: TosafotDoc, nodes: StructureNode[]): RawEdge[] {
  const ids = new Set(nodes.map((n) => n.id))
  const edges: RawEdge[] = doc.visualSummary.edges
    .filter((e) => ids.has(e.from) && ids.has(e.to))
    .map((e) => ({ from: e.from, to: e.to, type: e.type, label: e.label, explanation: e.explanation }))
  const linked = new Set(edges.flatMap((e) => [e.from, e.to]))
  const seen = new Set<string>()
  const add = (from: string, to: string) => {
    if (seen.has(`${from}>${to}`)) return
    seen.add(`${from}>${to}`)
    edges.push({ from, to, type: 'hierarchie' })
  }
  const parent = new Map<string, string>()
  for (const n of nodes) for (const c of n.children ?? []) parent.set(c.id, n.id)
  for (const n of nodes) {
    if (linked.has(n.id)) continue
    const p = parent.get(n.id)
    if (p) add(p, n.id)
    // Racine isolée : rattachée à ses enfants pour garder la partie d'un seul tenant.
    else for (const c of n.children ?? []) add(n.id, c.id)
  }
  return edges
}

type LayoutGraph = Graph<GraphLabel, NodeLabel, EdgeLabel>

interface SectionLayout {
  g: LayoutGraph
  width: number
  height: number
  nodes: StructureNode[]
}

function layoutSection(
  root: StructureNode,
  edges: (RawEdge & { name: string })[],
  order: Map<string, number>,
): SectionLayout {
  const nodes = subtree(root)
  const g: LayoutGraph = new Graph<GraphLabel, NodeLabel, EdgeLabel>({ multigraph: true })
  g.setGraph({ rankdir: 'TB', nodesep: 24, ranksep: RANK_SEP, edgesep: 16, marginx: 0, marginy: 0 })
  g.setDefaultEdgeLabel(() => ({}))
  for (const n of nodes) g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  // Le premier nœud dans le texte est placé au-dessus : on oriente selon l'ordre du texte.
  const add = (a: string, b: string, label: EdgeLabel, name: string) => {
    const [v, w] = (order.get(a) ?? 0) > (order.get(b) ?? 0) ? [b, a] : [a, b]
    g.setEdge(v, w, label, name)
  }
  for (const e of edges) {
    const label = e.label ? { width: LABEL_WIDTH, height: LABEL_HEIGHT, labelpos: 'c' as const } : {}
    add(e.from, e.to, { ...label, weight: e.type === 'hierarchie' ? 1 : 2 }, e.name)
  }
  // Liens invisibles parent → enfant : la partie garde la forme de l'arbre du texte.
  for (const n of nodes) {
    for (const c of n.children ?? []) add(n.id, c.id, { weight: 0.5 }, `h-${c.id}`)
  }
  // Ordre gauche → droite de chaque rang = ordre du texte (déterministe, lisible).
  // Les points intermédiaires des longues flèches se placent entre leurs deux extrémités.
  const rank = (lg: LayoutGraph, id: string): number => {
    const n = lg.node(id)
    const e = n.edgeObj
    if (!n.dummy || !e) return order.get(id) ?? 0
    return ((order.get(e.v) ?? 0) + (order.get(e.w) ?? 0)) / 2
  }
  const customOrder = (lg: LayoutGraph) => {
    const byRank = new Map<number, string[]>()
    for (const id of lg.nodes()) {
      const r = lg.node(id).rank ?? 0
      byRank.set(r, [...(byRank.get(r) ?? []), id])
    }
    for (const ids of byRank.values()) {
      ids.sort((a, b) => rank(lg, a) - rank(lg, b)).forEach((id, i) => (lg.node(id).order = i))
    }
  }
  layout(g, { customOrder })
  const label = g.graph()
  return { g, nodes, width: Number(label.width ?? 0), height: Number(label.height ?? 0) }
}

export function layoutArguments(doc: TosafotDoc, nodes: StructureNode[]): ArgumentLayout {
  const order = new Map(nodes.map((n, i) => [n.id, i]))
  const raw = collectEdges(doc, nodes)
  const sectionOf = new Map<string, string>()
  for (const root of doc.structure) for (const n of subtree(root)) sectionOf.set(n.id, root.id)
  const internal = (e: RawEdge) => sectionOf.get(e.from) === sectionOf.get(e.to)

  const named = raw.map((e, i) => ({ ...e, name: `e${i}` }))
  const parts = doc.structure.map((root) =>
    layoutSection(root, named.filter((e) => internal(e) && sectionOf.get(e.from) === root.id), order),
  )
  const cross = raw.filter((e) => !internal(e))
  const laneSpace = cross.length * LANE_SEP + (cross.some((e) => e.label) ? LABEL_WIDTH : 0)
  const contentWidth = Math.max(0, ...parts.map((p) => p.width)) + 2 * SECTION_PAD
  const left = MARGIN + laneSpace + (cross.length ? LANE_SEP : 0)

  const boxes = new Map<string, Box>()
  const sections: Box[] = []
  const shift = new Map<string, Point>()
  let top = MARGIN
  parts.forEach((p, k) => {
    const dx = left + (contentWidth - p.width) / 2
    const dy = top + SECTION_PAD
    const id = doc.structure[k]!.id
    sections.push({ id, x: left + contentWidth / 2, y: top + p.height / 2 + SECTION_PAD, width: contentWidth, height: p.height + 2 * SECTION_PAD })
    for (const n of p.nodes) {
      const l = p.g.node(n.id)
      boxes.set(n.id, { id: n.id, x: (l.x ?? 0) + dx, y: (l.y ?? 0) + dy, width: NODE_WIDTH, height: NODE_HEIGHT })
    }
    shift.set(id, { x: dx, y: dy })
    top += p.height + 2 * SECTION_PAD + SECTION_GAP
  })

  const edges: LayoutEdge[] = []
  raw.forEach((e, i) => {
    if (!internal(e)) return
    const k = doc.structure.findIndex((r) => r.id === sectionOf.get(e.from))
    const p = parts[k]!
    const d = shift.get(doc.structure[k]!.id)!
    const forward = (order.get(e.from) ?? 0) <= (order.get(e.to) ?? 0)
    const label = forward ? p.g.edge(e.from, e.to, `e${i}`) : p.g.edge(e.to, e.from, `e${i}`)
    const pts = (label.points ?? []).map((q) => ({ x: q.x + d.x, y: q.y + d.y }))
    if (!forward) pts.reverse()
    const { point, angle } = midpoint(pts)
    const labelPos = e.label && label.x !== undefined ? { x: label.x + d.x, y: (label.y ?? 0) + d.y } : undefined
    edges.push({ id: `e${i}`, ...e, path: smoothPath(pts), mid: point, angle, labelPos })
  })
  edges.push(...routeCross(raw, cross, boxes, left))

  return { nodes: [...boxes.values()], sections, edges, width: left + contentWidth + MARGIN, height: top - SECTION_GAP + MARGIN }
}

/** Flèches entre parties : sortie par le haut ou le bas, couloir vertical à gauche. */
function routeCross(raw: RawEdge[], cross: RawEdge[], boxes: Map<string, Box>, left: number): LayoutEdge[] {
  const span = (e: RawEdge) => Math.abs((boxes.get(e.from)?.y ?? 0) - (boxes.get(e.to)?.y ?? 0))
  // Les flèches les plus longues prennent le couloir le plus à l'extérieur : pas de croisement.
  const sorted = [...cross].sort((a, b) => span(a) - span(b))
  const ports = new Map<string, number>()
  const portCount = new Map<string, number>()
  const portKey = (id: string, up: boolean) => `${id}:${up ? 't' : 'b'}`
  for (const e of sorted) {
    const up = boxes.get(e.to)!.y < boxes.get(e.from)!.y
    for (const key of [portKey(e.from, up), portKey(e.to, !up)]) portCount.set(key, (portCount.get(key) ?? 0) + 1)
  }
  const port = (box: Box, key: string) => {
    const used = ports.get(key) ?? 0
    ports.set(key, used + 1)
    return box.x + (used - ((portCount.get(key) ?? 1) - 1) / 2) * 18
  }
  return sorted.map((e, k) => {
    const s = boxes.get(e.from)!
    const t = boxes.get(e.to)!
    const up = t.y < s.y
    const dir = up ? -1 : 1
    const lane = left - LANE_SEP * (k + 1)
    const gutter = RANK_SEP / 2 - 8 + (k % 4) * 5
    const sx = port(s, portKey(e.from, up))
    const tx = port(t, portKey(e.to, !up))
    const sy = s.y + (dir * s.height) / 2
    const ty = t.y - (dir * t.height) / 2
    const pts: Point[] = [
      { x: sx, y: sy },
      { x: sx, y: sy + dir * gutter },
      { x: lane, y: sy + dir * gutter },
      { x: lane, y: ty - dir * gutter },
      { x: tx, y: ty - dir * gutter },
      { x: tx, y: ty },
    ]
    const { point, angle } = midpoint(pts)
    const labelPos = e.label ? { x: lane - LABEL_WIDTH / 2 - 6, y: (sy + ty) / 2 } : undefined
    return { id: `x${raw.indexOf(e)}`, ...e, path: roundedPath(pts), mid: point, angle, labelPos }
  })
}

/**
 * Attribution majoritaire des segments du nœud ; s'il n'en a pas, celle de ses
 * descendants. En cas d'égalité, la première rencontrée dans le texte.
 */
export function dominantAttribution(
  node: StructureNode,
  segment: (id: string) => Segment | undefined,
): string | undefined {
  const ids = node.segmentIds.length ? node.segmentIds : subtree(node).flatMap((n) => n.segmentIds)
  const counts = new Map<string, number>()
  for (const id of ids) {
    const a = segment(id)?.attribution
    if (a) counts.set(a, (counts.get(a) ?? 0) + 1)
  }
  let best: string | undefined
  let max = 0
  for (const [a, c] of counts) if (c > max) [best, max] = [a, c]
  return best
}
