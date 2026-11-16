/** Filtre de recherche simple (glossaire, abréviations, personnes). */

/** Minuscules, sans accents latins ; l'hébreu est gardé tel quel (״ et ׳ compris). */
export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC')
    .toLowerCase()
}

/** Vrai si un des champs contient la requête (requête vide = tout). */
export function matchesQuery(query: string, ...fields: (string | undefined)[]): boolean {
  const q = foldText(query.trim())
  if (!q) return true
  return fields.some((f) => f !== undefined && foldText(f).includes(q))
}
