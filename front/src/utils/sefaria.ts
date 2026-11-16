/**
 * URL de l'API Sefaria pour « Comparer avec Sefaria » (docs/UI_SPEC.md §7).
 * Seule exception à la règle « ne jamais construire d'URL Sefaria » : l'API n'est pas dans le JSON.
 */

const SEFARIA_API = 'https://www.sefaria.org/api/v3/texts/'

/**
 * « Tosafot on Bava Kamma 56b:10:1 » → « Tosafot_on_Bava_Kamma.56b.10.1 » :
 * mots du titre joints par « _ », « . » avant le דף, puis « : » → « . ».
 */
export function sefariaApiId(ref: string): string {
  const clean = ref.trim().replace(/\s+/g, ' ')
  const match = /^(.+?) (\d+[ab]?(?::\d+)*)$/.exec(clean)
  if (!match) return clean.replaceAll(' ', '_').replaceAll(':', '.')
  const [, title, location] = match
  return `${title!.replaceAll(' ', '_')}.${location!.replaceAll(':', '.')}`
}

export function sefariaApiUrl(ref: string): string {
  return SEFARIA_API + sefariaApiId(ref)
}
