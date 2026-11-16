# Spécification UI : affichage d'un תוספות

Données : `data/bk56b_tosafot_behahi_hanaa.json`. Le site est en français, avec l'hébreu et l'araméen en caractères hébreux, sans phonétique.

## 1. Principes

- **Hébreu partout où c'est un mot hébreu.** Les noms (רבה, רב יוסף), les termes (שומר שכר) et les références (ב״מ כט.) restent en hébreu, même au milieu d'une phrase française.
- **Le texte du תוספות est la colonne vertébrale.** Chaque segment est cité en entier, dans l'ordre. L'explication s'ouvre sous le segment.
- **Trois niveaux d'explication** : `essentiel`, `standard`, `approfondi`. Un sélecteur global change le niveau par défaut ; chaque bloc peut aussi être ouvert individuellement plus loin.
- **Composants courts** : moins de 200-300 lignes par composant (voir la liste en §9).

## 2. Texte bidirectionnel (RTL / LTR)

C'est le point technique le plus important.

- Le document est en `lang="fr" dir="ltr"`.
- Tout bloc hébreu complet (`segment.he`, `gemara.text`, cellules de table en hébreu) : `<p lang="he" dir="rtl">`.
- **Hébreu au milieu du français** : le JSON contient du texte mixte (« selon רבה, le gardien… »). L'UI doit :
  1. découper le texte en suites de caractères hébreux (`/[\u0590-\u05FF\uFB1D-\uFB4F][\u0590-\u05FF\uFB1D-\uFB4F\s״׳"'.:,()\-]*/`) ;
  2. envelopper chaque suite dans `<bdi lang="he" class="he-inline">` ;
  3. ne jamais utiliser `dir="auto"` sur un paragraphe mixte (le premier mot décide du sens, ce qui casse les phrases qui commencent par un nom hébreu).
- Les guillemets « » et les parenthèses autour de l'hébreu restent hors du `<bdi>` pour ne pas être retournés.
- Police hébraïque : une police avec les signes ״ ׳ (Frank Ruehl CLM, SBL Hebrew, Noto Serif Hebrew). Taille hébreu ≈ 115 % du français.
- Les caractères ״ (U+05F4) et ׳ (U+05F3) sont déjà normalisés dans le JSON. Ne pas les remplacer par " et '.
- Option d'affichage « police Rashi » (Noto Rashi Hebrew) pour le texte du תוספות, comme dans la Guemara imprimée.

## 3. Vues

### 3.1 Vue « Structure » (par défaut)

Arbre repliable construit depuis `structure` (récursif via `children`).

```
I   Définition : quand existe la dispense…            [Thèse]
    ├ 1 Preuve du פסוק : סוכה כה.                       [Preuve]
    ├ 2 Preuve de סברא : les תפילין                     [Preuve]
    └ 3 Preuve de נדרים לג:                              [Preuve]
    ⇒ Donc : seulement quand il s'occupe activement…
II  ר״ח et בה״ג : la הלכה est comme רב יוסף…           [פסק]
    ├ A 1re preuve : נדרים לג:                          [Preuve]
    │  └ ↳ Rejet de ר״י                                 [Rejet]
    …
```

Pour chaque nœud :
- numéro + titre + badge de rôle (couleur de `meta.roles`) ;
- `summary[niveau]` ; si un niveau manque, afficher le niveau inférieur le plus proche (`approfondi` → `standard` → `essentiel`) ;
- `conclusion` éventuelle, mise en évidence (⇒) ;
- au clic : déplier les enfants **et** les segments du nœud (`segmentIds`), dans l'ordre.

Bouton « Tout déplier / Tout replier ». L'état replié est gardé dans l'URL (`#open=I,II.A`) pour pouvoir partager un lien.

### 3.2 Vue « Texte continu »

Le תוספות en entier, comme dans la Guemara, en RTL. Chaque segment est un `<span>` cliquable :
- souligné de la couleur de son rôle (option « couleurs » activable) ;
- survol : infobulle avec `explanation.essentiel` ;
- clic : panneau latéral avec la traduction, l'explication du niveau choisi, les termes, les notes, les sources et les tables.
- Des repères discrets (I, II, II.A…) en marge, au début de chaque nœud.

### 3.3 Vue « Carte d'arguments »

Graphe orienté construit depuis `structure` (nœuds) et `visualSummary.edges` (flèches).
- Disposition en arbre de haut en bas (dagre ou elkjs), dans l'ordre du texte.
- Type de flèche selon `edge.type` : `prouve` (vert, plein), `rejette` (orange, barré), `objecte` (rouge, pointillé), `répond` (bleu-vert), `fonde` (gris, pointillé, avec `label`).
- Couleur du nœud selon l'attribution (`ר״ח ובה״ג` / `ר״י` / `תוספות`), en plus du rôle.
- Clic sur un nœud : même panneau latéral qu'en 3.2.
- Légende fixe en bas.

### 3.4 Vue « Contexte »

Avant la lecture : `context.levels[niveau]`, les passages de Guemara (`context.gemara` : hébreu en RTL + traduction), puis les tables listées dans `context.tableIds`.

### 3.5 Vue « Synthèse »

`synthesis.takeaways` (3 points), `synthesis.halacha`, `synthesis.review` (questions avec réponse cachée : bouton « Voir la réponse »), `synthesis.nextPreview`.

### 3.6 Vue « Cours » (future)

Voir `docs/TODO.md`.

## 4. Carte d'un segment

```
┌──────────────────────────────────────────────────────────┐
│ s7 · I.3 · [Preuve] · תוספות              [↗ Sefaria] │
│                                                          │
│   ועוד דבפרק אין בין המודר (נדרים לג:) אמר ...   (RTL)    │
│                                                          │
│ Traduction : Et de plus, au פרק אין בין המודר …           │
│ ▸ Explication [Essentiel | Standard | Approfondi]       │
│ ▸ Mots (5)    ▸ Notes textuelles (1)    ▸ Sources (2)   │
└──────────────────────────────────────────────────────────┘
```

- **Mots** (`terms`) : table à deux colonnes, `he` (RTL) | `fr`, avec `note` en petit. Au survol d'un mot dans le texte hébreu, si ce mot (ou cette suite) apparaît dans `terms`, le surligner et afficher l'infobulle.
- **Notes textuelles** (`notes`) : icône ⚠, fond jaune pâle. Ce sont des remarques sur l'édition (renvois faux, doublons, parenthèses ajoutées).
- **Sources** (`sourceIds` → `sources`) : liste de `ref` en hébreu, lien vers `url` (Sefaria), `role` en sous-titre. Ne jamais construire d'URL soi-même : utiliser celles du JSON.
- **Tables** (`tableIds`) : bouton « Voir la table » qui ouvre la table (§5) dans une fenêtre modale.
- Les explications vides (`""`) ne sont pas affichées, et le niveau correspondant est grisé.

## 5. Tables

Rendu générique depuis `tables[]` : `title`, `columns`, `rows`, `note`.
- Direction de la table : LTR (la première colonne est l'étiquette) ; chaque cellule passe par le découpage hébreu de §2.
- Les valeurs `חייב` / `פטור` reçoivent une couleur (rouge pâle / vert pâle).
- La table `t-shomrim` est aussi accessible depuis un bouton fixe « Les 4 שומרים » (c'est la base de tout le passage).

## 6. Glossaire, abréviations, personnes

- `abbreviations` : dans le texte hébreu, chaque abréviation (mot contenant ״) trouvée dans la liste reçoit un soulignement pointillé ; au survol, `full`. Si `warning` existe (cas de « ר״א »), l'infobulle choisit la forme selon le segment (`s15` → ר׳ אלעזר ; `s34`, `s35`, `s37` → ר׳ אליעזר) et affiche l'avertissement.
- `people` : les noms dans les explications ouvrent une fiche (nom, `full`, `type`, `description`).
- `glossary` : page dédiée, et infobulles sur ces termes dans les explications.

## 7. Bouton « Vérifier le texte » (obligatoire)

Objectif : prouver qu'aucun mot du תוספות ne manque et qu'aucun mot n'est en trop.

Algorithme (identique à `tools/check_tosafot.py`, à porter en TypeScript) :

1. `normalize(t)` : NFC ; `"` → `״`, `'` → `׳` ; espaces multiples → un espace ; trim.
2. `expected = normalize(source.fullText).split(" ")`.
3. `actual = segments.flatMap(s => normalize(s.he).split(" "))`.
4. Comparer mot à mot avec un diff (Myers ou LCS : la librairie `diff`, `diffArrays`, suffit).
5. Vérifier aussi : chaque segment est dans exactement un nœud de `structure`, et l'ordre des `segmentIds` dans l'arbre (parcours en profondeur) est celui de `segments`.

Affichage :
- Succès : badge vert « ✓ 694 mots, 41 segments, texte complet et structure dans l'ordre ».
- Échec : badge rouge et liste des différences : « MANQUANT après «…3 mots…» : X » / « EN TROP après «…» : Y ». Clic sur une ligne : défile vers le segment concerné et le surligne.
- Option « Comparer avec Sefaria » : récupère le texte en direct (`https://www.sefaria.org/api/v3/texts/Tosafot_on_Bava_Kamma.56b.10.1`), le normalise et le compare à `fullText`. Si l'appel échoue, l'afficher clairement sans bloquer la vérification locale.

Le script Python fait la même chose en ligne de commande (à lancer avant chaque publication) :

```
python tools/check_tosafot.py data/bk56b_tosafot_behahi_hanaa.json --sefaria tools/raw_bk56b_10.txt
```

## 8. Préférences utilisateur

Gardées en `localStorage` : niveau par défaut, vue par défaut, couleurs des rôles on/off, traduction visible on/off, police hébraïque, taille du texte.

## 9. Découpage en composants (Vue ou React)

| Composant | Rôle |
|---|---|
| `TosafotPage` | Charge le JSON, onglets des vues, préférences |
| `LevelSelector` | Essentiel / Standard / Approfondi |
| `StructureTree` + `StructureNode` | Vue 3.1 (récursif) |
| `ContinuousText` | Vue 3.2 |
| `ArgumentMap` | Vue 3.3 (dagre / elkjs + SVG, ou Vue Flow / React Flow) |
| `ContextView`, `SynthesisView` | Vues 3.4, 3.5 |
| `SegmentCard`, `SegmentPanel` | Carte et panneau latéral d'un segment |
| `HebrewText` | Découpage RTL/LTR de §2 (utilisé partout) |
| `AbbrTooltip`, `TermTooltip`, `PersonCard` | Infobulles et fiches |
| `DataTable` | Tables génériques |
| `TextIntegrityCheck` | Bouton §7 |

Le schéma est générique : un autre תוספות = un autre fichier JSON avec les mêmes champs.

## 10. Schéma (résumé)

```
meta            id, title, levels[], roles[], attributions[], methodology
context         levels{essentiel,standard,approfondi}, gemara[{ref,text,translation,sourceId}], tableIds[]
source          ref, sefariaUrl, normalization, tokenization, fullText
people[]        id, name, full?, type, description
structure[]     id, number, title, role, summary{niveau}, segmentIds[], children[], conclusion?
structureCorrections   items[{section, change}]   (différences avec les notes du cours)
segments[]      id, nodeId, role, attribution, he, translation, explanation{niveau},
                terms[{he,fr,note?}], notes[]?, sourceIds[], tableIds[]?
tables[]        id, title, columns[], rows[][], note?
sources[]       id, ref, sefaria, url, role?, consulted
abbreviations[] he, full, warning?
glossary[]      he, fr
synthesis       takeaways[3], halacha{niveau}, review[{q,a}], nextPreview
visualSummary   recommended, why, edges[{from,to,type,label?}]
```

`structureCorrections` peut s'afficher dans une page « Notes de préparation » (pour comparer avec la structure du cours), pas dans la lecture principale.
