# Pièges connus

Chaque point vient du projet ou d'une documentation officielle. Les règles complètes sont dans
`../front/STANDARDS.md` ; ici, seulement ce qui fait régulièrement perdre du temps.

## Vuetify 4 (pas 3)

- Typographie MD3 : `text-headline-*`, `text-title-*`, `text-body-*`, `text-label-*`. Les classes
  `text-h1…h6`, `text-subtitle-*`, `text-caption`, `text-overline` n'existent plus.
- Élévation de 0 à 5. `VRow` n'a plus `dense`, `align`, `justify` : utiliser `align-center`,
  `justify-space-between`, `ga-*`.
- Boutons non mis en majuscules. Slots de `VSelect` : `item` est l'objet brut, `internalItem` l'objet Vuetify.
- Composants importés automatiquement par `vite-plugin-vuetify` : ne pas les importer à la main.
- Les overlays (dialog, menu, select, tooltip) sont préchargés dans `optimizeDeps` de `vite.config.ts` :
  ne pas retirer cette liste.
- Les locales de Vuetify passent par vue-i18n (`src/plugins/vuetify.ts`, `src/i18n/index.ts`). Ne pas
  recréer `createVuetify({ locale: { messages } })`.

## Vue / TypeScript

- `<script setup lang="ts">`, props par `defineProps<{…}>()`, événements par `defineEmits<{…}>()`,
  `defineModel<T>()`. `noUncheckedIndexedAccess` est actif : `arr[0]` vaut `T | undefined`.
- `provideTosafot` doit être appelé de façon synchrone dans `setup` (voir `TosafotReader.vue`).
- `useTosafot()` lève une erreur hors de `TosafotReader`. Les tests ou aperçus isolés doivent fournir le contexte.
- Un `<template>` à racines multiples est valide dans ce projet (pages avec `v-app-bar` + `v-main`).

## i18n

- Template : `$t('clé')`. Script : `const { t } = useI18n()`. Hors composant : `import { t } from '@/i18n'`.
- Dans un `<template>`, une chaîne qui contient de l'hébreu passe par `<HebrewText :text="$t('clé')" />`,
  pas par un `<bdi>` écrit à la main.
- Ne pas traduire : le contenu du JSON des תוספות, les ids, les noms propres (Sefaria), les icônes `mdi-*`.
- `fr.json` est la seule langue. Pour une seconde langue, ajouter un fichier et l'enregistrer dans
  `src/i18n/index.ts` ; ne pas dupliquer les clés dans les composants.
- Piège de syntaxe vue-i18n : `@`, `|`, `{` et `}` ont un sens dans un message (lien vers un autre message,
  pluriel, paramètre). Pour les afficher tels quels, les passer en paramètre ou les écrire entre
  guillemets dans une interpolation littérale : `{'@'}`.

## Hébreu

- Tout `<bdi>` hébreu porte `lang="he" dir="rtl"`. Jamais `dir="auto"` sur un paragraphe mixte.
- Ne jamais remplacer ״ et ׳ par `"` et `'`. Ne jamais transcrire l'hébreu en phonétique.
- Les URL Sefaria viennent du JSON (`source.url`). Seule exception : `src/utils/sefaria.ts` (API).

## Édition de fichiers sous Windows / PowerShell

- Préférer l'outil de remplacement exact d'un éditeur à un script. Une modification groupée par script
  a déjà corrompu des fichiers (lettres remplacées dans `ArgumentMap.vue`, `SegmentHeader.vue`…) : après
  tout script touchant plusieurs fichiers, faire `git diff --stat` et `npm run typecheck`.
- En PowerShell, un tableau d'un seul couple `@(@('a','b'))` est aplati ; écrire `@(,@('a','b'))`.
- Le shell du projet est PowerShell : `&&` n'existe pas, utiliser `;`. Les avertissements « LF will be
  replaced by CRLF » de git sont sans gravité.
- Écrire les fichiers en UTF-8 sans BOM. Un fichier relu avec la mauvaise page de code affiche des
  `×ª×•×¡×¤×•×ª` à la place de l'hébreu : ne pas le réenregistrer tel quel.
