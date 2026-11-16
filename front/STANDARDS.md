# Standards du front (à suivre par tout contributeur, humain ou agent)

Lire d'abord `../docs/UI_SPEC.md` (la spécification) et `src/types/tosafot.ts` (le schéma).

## Stack

- Vue 3.5, `<script setup lang="ts">`, TypeScript strict (`noUncheckedIndexedAccess` actif).
- **Vuetify 4** (pas 3). Différences à connaître :
  - Typographie MD3 : `text-display-*`, `text-headline-*`, `text-title-*`, `text-body-*`, `text-label-*`. **Pas** de `text-h1`… `text-h6`, `text-subtitle-*`, `text-caption`, `text-overline`.
  - Élévation 0 à 5 seulement.
  - `VRow` : pas de prop `dense`, `align`, `justify` → classes utilitaires (`align-center`, `justify-space-between`) ou `gap`.
  - Les boutons ne sont plus en majuscules.
  - Slots `VSelect` : `item` = l'objet brut ; `internalItem` = l'objet Vuetify.
- Composants Vuetify importés automatiquement (`vite-plugin-vuetify`). Ne pas les importer à la main.
- Icônes : `mdi-*` (`@mdi/font`).
- Routeur : `vue-router` en mode hash. Route `tosafot` : `/:slug/:view?`, query `open` pour l'arbre.

## Règles

1. **Vuetify d'abord.** Utiliser `v-card`, `v-list`, `v-chip`, `v-btn`, `v-expansion-panels`, `v-tooltip`, `v-dialog`, `v-navigation-drawer`, `v-table`, `v-alert`, `v-tabs`, `v-btn-toggle`, `v-sheet`, `v-divider`, `v-treeview` si adapté… Le HTML brut est réservé à ce que Vuetify ne fait pas : `<bdi>`, `<p lang="he" dir="rtl">`, `<svg>` de la carte, `<span>` des segments en texte continu.
2. **200 lignes max par `.vue`** (script + template + style), viser 150. Si ça dépasse, découper en sous-composants dans le même dossier.
3. **Logique réutilisable dans des `.ts`** : `src/utils/` (fonctions pures), `src/composables/` (état réactif, `useXxx`). Pas de logique métier lourde dans les templates.
4. **Props typées** avec `defineProps<{…}>()` et `withDefaults` ; événements avec `defineEmits<{…}>()` (syntaxe typée). `v-model` via `defineModel<T>()`.
5. Noms : composants en `PascalCase.vue`, composables `useXxx.ts`, utils en `camelCase.ts`. Un composant par fichier.
5b. **Ordre des blocs dans un `.vue`** : `<template>` en premier, au début du fichier, puis `<script setup lang="ts">`, puis `<style scoped>`. Jamais le `<template>` à la fin.
6. **Texte en français, termes en hébreu.** Ne jamais transcrire l'hébreu en phonétique. Libellés de l'UI en français.
6b. **Aucun texte d'interface en dur : tout passe par vue-i18n.** Les messages sont dans `src/i18n/locales/fr.json` (clés groupées par zone : `menu.*`, `map.*`, `integrity.*`…). Pour ajouter une langue : créer `locales/<code>.json` et l'enregistrer dans `src/i18n/index.ts`.
   - Dans un template : `{{ $t('clé') }}`, `:label="$t('clé')"`, `:aria-label="$t('clé')"`. Avec paramètres : `$t('clé', { id })`, et `{id}` dans le message. Pluriels : `{count}` dans le message.
   - Dans `<script setup>` : `const { t } = useI18n()` (`vue-i18n`).
   - Hors composant (`utils/`, `composables/`) : `import { t } from '@/i18n'`.
   - Les tables de données (onglets, styles de flèches…) portent une **clé** (`labelKey`), pas un libellé ; le composant appelle `$t(labelKey)`.
   - Un message qui contient de l'hébreu s'affiche avec `<HebrewText :text="$t('clé')" />` (règle 7).
   - Ne pas traduire : textes venant du JSON des תוספות, ids techniques, noms propres (Sefaria), icônes.
   - Une clé = un sens. Ne pas construire une phrase en collant plusieurs messages : mettre la phrase entière avec ses paramètres.
7. **Tout texte qui peut contenir de l'hébreu passe par `<HebrewText :text="…" />`** (`src/components/common/HebrewText.vue`). Ne jamais mettre `dir="auto"` sur un paragraphe mixte.
7b. Tout `<bdi>` hébreu porte **`lang="he" dir="rtl"`** : sans `dir`, un `<bdi>` prend la direction de son premier caractère fort, et la ponctuation (« : » de נו:, parenthèses) se retrouve du mauvais côté.
7c. Couleurs : chaque fond du thème a sa couleur « on-… » ; ne jamais poser un fond (`color="surface-variant"`…) sans vérifier le texte dessus. Les couleurs de rôle passent par `roleColor()`, qui les adapte au thème. Contrôle : `node scripts/contrast.mjs` (avec `npm run preview`), qui doit afficher OK partout.
8. Bloc entièrement hébreu : `<p lang="he" dir="rtl" class="he-block">`. Texte du תוספות : ajouter la classe `he-tosafot` (police Rashi optionnelle).
9. Ne jamais construire d'URL Sefaria : utiliser `source.url` du JSON. Liens externes : `target="_blank" rel="noopener"`.
10. Ne jamais remplacer ״ et ׳ par " et '.
11. Couleurs : rôles = `roleColor(id)` du JSON ; le reste = couleurs du thème (`primary`, `secondary`, `accent`, `surface-variant`, `note-bg`…). Pas de couleur codée en dur hors `src/utils/` (ex. couleurs des flèches) et du thème.
12. Styles : `<style scoped>`, courts. Préférer les classes utilitaires Vuetify (`pa-4`, `d-flex`, `ga-2`, `text-medium-emphasis`…).
13. Accessibilité : `aria-label` sur les boutons icône ; éléments cliquables atteignables au clavier (utiliser `v-btn`, `v-list-item` ou `tabindex="0"` + `@keydown.enter`).
14. Pas de nouvelle dépendance npm sans accord. Déjà installées : `vue`, `vuetify`, `vue-router`, `diff`, `@dagrejs/dagre`, polices.
15. Commentaires : en français, seulement pour expliquer le pourquoi.
16. Vérifier avant de rendre : `npm run typecheck` dans `front/` doit passer sans erreur.

## Socle existant (ne pas réécrire, réutiliser)

| Fichier | Contenu |
|---|---|
| `src/types/tosafot.ts` | Tous les types du JSON, `LevelId`, `LEVELS`, `Leveled` |
| `src/utils/hebrew.ts` | `splitHebrew(text)`, `containsHebrew(text)` |
| `src/utils/levels.ts` | `pickLevel(leveled, level)` (repli vers le niveau inférieur), `hasLevel` |
| `src/utils/abbreviations.ts` | `buildAbbrIndex`, `findAbbreviation(word, index, segmentId)` (gère « ר״א »), `findTerms(words, terms)` |
| `src/utils/integrity.ts` | `normalize`, `tokens`, `flattenNodes`, `wordDiff`, `checkIntegrity(doc)`, `compareWithSefaria(doc, url)` |
| `src/composables/useTosafot.ts` | `provideTosafot(docRef)` (appelé par `TosafotPage`) et `useTosafot()` : `doc`, `nodes`, `segment(id)`, `node(id)`, `nodePath(id)`, `source(id)`, `table(id)`, `person(id)`, `role(id)`, `roleColor(id)`, `attributionLabel(id)` |
| `src/composables/usePreferences.ts` | `usePreferences()` : objet réactif `level`, `view`, `roleColors`, `showTranslation`, `hebrewFont`, `textScale`, `theme` (localStorage) |
| `src/composables/useSegmentPanel.ts` | État partagé : `selectedSegmentId`, `selectedNodeId`, `openTableId`, `highlightedSegmentId`, `openSegment(id)`, `openNode(id)`, `closePanel()`, `openTable(id)`, `closeTable()`, `scrollToSegment(id)` |
| `src/data/catalog.ts` | `catalog`, `findEntry(slug)` : les JSON de `/data` |
| `src/components/common/HebrewText.vue` | props `text`, `tag?` |
| `src/styles/main.css` | classes `he-inline`, `he-block`, `he-tosafot`, `he-abbr`, `he-term`, `segment-flash` |

Les éléments qui représentent un segment portent `:data-segment-id="segment.id"` et la classe `segment-flash` quand `highlightedSegmentId === segment.id` (pour `scrollToSegment`).

## Contrats des composants (noms, emplacement et props imposés)

Chaque composant lit le document via `useTosafot()` ; on ne passe que des ids ou des petits objets.

| Composant | Fichier | Props / événements |
|---|---|---|
| `TosafotPage` | `src/pages/TosafotPage.vue` | props `slug: string`, `view?: string` ; charge le JSON, `provideTosafot`, barre d'app, onglets, `SegmentPanel`, `TableDialog` |
| `CatalogPage` | `src/pages/CatalogPage.vue` | liste des תוספות disponibles |
| `AppHeader` | `src/components/layout/AppHeader.vue` | titre, `LevelSelector`, bouton « Les 4 שומרים », bouton préférences ; emit `open-preferences` |
| `ViewTabs` | `src/components/layout/ViewTabs.vue` | `v-model: ViewId` |
| `PreferencesDrawer` | `src/components/layout/PreferencesDrawer.vue` | `v-model: boolean` |
| `LevelSelector` | `src/components/common/LevelSelector.vue` | `v-model: LevelId`, prop `available?: LevelId[]` (niveaux non vides ; les autres grisés), `density?` |
| `RoleChip` | `src/components/common/RoleChip.vue` | prop `role: string` (id), `size?` |
| `PersonCard` | `src/components/common/PersonCard.vue` | prop `personId: string` |
| `DataTable` | `src/components/tables/DataTable.vue` | prop `tableId: string` (§5 ; חייב / פטור colorés) |
| `TableDialog` | `src/components/tables/TableDialog.vue` | lit `openTableId` de `useSegmentPanel` |
| `TosafotHebrew` | `src/components/segment/TosafotHebrew.vue` | props `segmentId: string` ; texte hébreu RTL du segment avec abréviations (`AbbrTooltip`) et termes (`TermTooltip`) |
| `AbbrTooltip`, `TermTooltip` | `src/components/segment/` | infobulles `v-tooltip` sur un mot |
| `SegmentCard` | `src/components/segment/SegmentCard.vue` | prop `segmentId: string` (§4) |
| `SegmentPanel` | `src/components/segment/SegmentPanel.vue` | `v-navigation-drawer` à droite (location `end`), lit `selectedSegmentId` / `selectedNodeId` |
| `SegmentDetails` | `src/components/segment/SegmentDetails.vue` | prop `segmentId` ; traduction, explication, mots, notes, sources, tables (partagé par carte et panneau) |
| `StructureTree` | `src/components/structure/StructureTree.vue` | vue 3.1 ; état ouvert dans `route.query.open` |
| `StructureNode` | `src/components/structure/StructureNode.vue` | récursif, prop `nodeId: string`, `depth: number` |
| `ContinuousText` | `src/components/text/ContinuousText.vue` | vue 3.2 |
| `ArgumentMap` | `src/components/map/ArgumentMap.vue` | vue 3.3 (dagre + SVG) ; clic sur nœud → `openNode(id)` |
| `ContextView` | `src/components/views/ContextView.vue` | vue 3.4 |
| `SynthesisView` | `src/components/views/SynthesisView.vue` | vue 3.5 |
| `GlossaryView` | `src/components/views/GlossaryView.vue` | glossaire, abréviations, personnes |
| `PreparationNotes` | `src/components/views/PreparationNotes.vue` | `structureCorrections` + `meta.methodology` |
| `TextIntegrityCheck` | `src/components/integrity/TextIntegrityCheck.vue` | bouton §7 (dialogue avec résultat) |

`ViewId` (dans `usePreferences.ts`) : `'context' | 'structure' | 'text' | 'map' | 'synthesis'`. Les vues « Glossaire » et « Notes de préparation » s'ouvrent depuis le menu de la barre d'app (route `view` = `glossary` / `notes`).

## Design

- Thème clair « parchment » (fond crème, primaire bleu nuit, secondaire or) et thème sombre « night ». Ne pas inventer d'autres couleurs de fond.
- Mise en page aérée : largeur de lecture max ~ 960 px centrée (`v-container` + `max-width`), cartes `variant="flat"` ou `"outlined"`, élévation 0-1.
- Le texte hébreu doit dominer visuellement ; le français est secondaire (`text-medium-emphasis` pour la traduction).
- Responsive : utilisable sur mobile (panneau latéral en `temporary` sous `md`, via `useDisplay()`).
