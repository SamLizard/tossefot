# Idées d'évolution du schéma JSON

Propositions issues de la construction du front. Aucune n'est nécessaire aujourd'hui ; chacune lèverait une limite constatée.

## Corrections de données repérées

- **4 termes introuvables dans le texte** du segment (le front ne peut pas les surligner) :
  - s20 `בר מ־` et s34 `והא ד־` : chevauchent un terme plus long du même segment ;
  - s37 `גוביינא` : le mot n'est pas dans le segment ;
  - s38 `לא קאי… כוותיה` : contient « … », donc ne correspond à aucune suite de mots.
  Proposition : ajouter un champ optionnel `match` (la forme exacte dans le texte) ou `wordRange: [début, fin]`.
- **« ר״א » ambigu** : la règle par segment (s15 / s34, s35, s37) est codée en dur dans `front/src/utils/abbreviations.ts`. La mettre dans le JSON :
  `{ "he": "ר״א", "bySegment": { "s15": "רבי אלעזר", "s34": "רבי אליעזר", ... } }`.

## Liens plus riches

- `segments[].peopleIds` : les personnes citées dans le segment (aujourd'hui, le front ne peut pas savoir où ouvrir une fiche `PersonCard` sans chercher les noms dans le texte).
- `segments[].glossaryRefs` : idem pour le glossaire.
- `sources[].quote` : la phrase exacte de la source citée par le תוספות (hébreu + traduction), pour l'afficher sans aller sur Sefaria, et hors ligne.
- `sources[].page` + `sources[].line` : localisation précise (comme « שורות 13-14 » dans les notes).
- `edges[].explanation` : une phrase sur la flèche (« pourquoi I fonde II.A.r »), affichable au survol dans la carte.

## Pédagogie

- `segments[].questions[]` : question de compréhension par segment (en plus de `synthesis.review`), pour un mode « quiz » en lisant.
- `review[].segmentIds` : remplacer les références « (s10-s11) » écrites dans le texte des réponses par un champ structuré, pour pouvoir cliquer.
- `structure[].difficulty` (1-3) : signaler les passages difficiles.
- `meta.prerequisites[]` : autres תוספות / סוגיות à connaître avant (liens vers d'autres fichiers JSON du catalogue).
- `meta.related[]` : תוספות parallèles (ex. ב״מ כט. ד״ה והוי) avec, si le fichier existe, le `slug` du catalogue.

## Cours enregistré (voir TODO.md)

- `shiurim[]` dans un fichier séparé, ou `segments[].shiur: { file, start, end }` pour un badge « 🎧 14:44 ».

## Technique

- `meta.schemaVersion` existe déjà : le front pourrait refuser (ou avertir) si la version n'est pas supportée. Publier un **JSON Schema** (`data/tosafot.schema.json`) pour valider les fichiers dans l'éditeur et dans `check_tosafot.py`.
- `meta.updatedAt` et `meta.authors` : nécessaires pour la PWA (savoir si le cache est à jour) et pour la relecture par le rabbin.
- `meta.review: { status: "brouillon" | "relu", by, date, notes }` : suivi de la relecture de la structure.
