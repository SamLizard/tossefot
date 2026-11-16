/** Fonctions pures sur l'arbre `structure`. */
import type { StructureNode } from '@/types/tosafot'

/** Premier segment d'un nœud : le sien, sinon celui de son premier descendant qui en a. */
export function firstSegmentId(node: StructureNode): string | undefined {
  if (node.segmentIds[0]) return node.segmentIds[0]
  for (const child of node.children ?? []) {
    const id = firstSegmentId(child)
    if (id) return id
  }
  return undefined
}

/**
 * Repères du texte continu : segment → ids des nœuds qui commencent à ce segment,
 * dans l'ordre du parcours en profondeur (ex. s8 → [II], s9 → [II.A]).
 */
export function nodeStartMarkers(nodes: StructureNode[]): Map<string, string[]> {
  const markers = new Map<string, string[]>()
  for (const node of nodes) {
    const id = firstSegmentId(node)
    if (!id) continue
    const list = markers.get(id)
    if (list) list.push(node.id)
    else markers.set(id, [node.id])
  }
  return markers
}

/** Rôles utilisés par une liste d'éléments, dans l'ordre de `roleIds` (pour la légende). */
export function usedRoles(roleIds: string[], items: { role: string }[]): string[] {
  const used = new Set(items.map((i) => i.role))
  return roleIds.filter((id) => used.has(id))
}
