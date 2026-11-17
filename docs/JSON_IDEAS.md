# Demandes et questions pour le créateur du JSON

Ce document s'adresse à la personne (ou à la chaîne d'IA) qui produit `data/*.json`.
Il liste ce que le front aimerait recevoir pour la première version (MVP), et pose des questions.
Rien n'est obligatoire : pour chaque point, dire si c'est faisable, et sous quelle forme.
Les idées pour plus tard sont dans `TODO.md` (section « À réfléchir après le MVP »).

## 1. Corrections dans le fichier actuel

### 1.1 Termes (`segments[].terms`) introuvables dans le texte hébreu

Le front surligne chaque terme dans `segment.he` et affiche sa traduction au survol. Il faut donc que `term.he` soit une suite de mots **présente dans `segment.he`**. Ce n'est pas le cas pour 4 termes :

| Segment | Terme | Problème |
|---|---|---|
| s20 | `בר מ־` | chevauche un autre terme plus long du même segment |
| s34 | `והא ד־` | idem |
| s37 | `גוביינא` | le mot est dans l'**explication** (citation de רש״י : « סבר וקביל לגוביינא »), pas dans le texte du תוספות |
| s38 | `לא קאי… כוותיה` | contient « … » : aucune suite de mots ne correspond |

Proposition :
- `terms` = seulement des mots du texte du segment, sans « … » ;
- les mots des explications vont dans le `glossary` (גוביינא y est déjà), et le front les reconnaîtra dans les explications ;
- si un terme est discontinu (`לא קאי… כוותיה`), le donner en deux termes, ou ajouter un champ `match: ["לא קאי", "כוותיה"]`.

**Question :** préfères-tu le champ `match`, ou séparer les termes ?

### 1.2 L'abréviation ambiguë « ר״א »

La règle « s15 → ר׳ אלעזר ; s34, s35, s37 → ר׳ אליעזר » est écrite dans `warning` en texte libre, et le front l'a recopiée dans son code. Il serait plus sûr de l'avoir dans le JSON :

```json
{ "he": "ר״א", "full": "רבי אלעזר / רבי אליעזר",
  "bySegment": { "s15": "רבי אלעזר", "s34": "רבי אליעזר", "s35": "רבי אליעזר", "s37": "רבי אליעזר" },
  "warning": "Même abréviation pour deux personnes différentes." }
```

## 2. Personnes (`people`) : des fiches plus riches

Aujourd'hui une personne = `name`, `full`, `type`, `description`. On voudrait une vraie fiche : une belle carte au survol et une page par personne.

Champs souhaités (tous optionnels) :

| Champ | Exemple | Usage dans l'UI |
|---|---|---|
| `era` | `"אמוראי בבל, דור 3"` | badge d'époque, frise |
| `dates` | `{ "from": 270, "to": 320, "approx": true }` | frise chronologique |
| `places` | `["פומבדיתא"]` | sous-titre |
| `aliases` | `["רבה בר נחמני", "רבה"]`, et les erreurs connues (`"רבא"` ≠ `רבה`) | reconnaître la personne dans le texte et les explications |
| `teachers`, `students`, `colleagues` | ids d'autres personnes | liens entre fiches |
| `links` | `{ "wikipedia_he": "…", "wikipedia_fr": "…", "sefaria": "…" }` | boutons « Wikipédia », « Sefaria ». URLs vérifiées, pas construites |
| `segmentIds` | `["s8", "s9"]` | « Apparaît dans ce תוספות : … » |
| `summary` | `{ "essentiel": "…", "standard": "…" }` | même logique de niveaux que le reste |

Et dans les segments : `peopleIds: ["rabba", "rav-yosef"]`, pour ouvrir la bonne fiche sans chercher les noms dans le texte (c'est difficile à cause des préfixes, des abréviations et des homonymes).

**Questions :**
- Lesquels de ces champs peux-tu fournir de façon fiable ? Les dates et les générations surtout : vaut-il mieux les omettre que de les deviner ?
- Les liens Wikipédia : peux-tu vérifier qu'ils existent (pas d'URL inventée) ?
- Les images (portraits, gravures) posent un problème de droits : à éviter pour l'instant, sauf avis contraire.

## 3. Autres liens utiles pour le MVP

- `segments[].glossaryRefs` : les termes du glossaire présents dans l'explication du segment (même raison que `peopleIds`).
- `sources[].quote` : la phrase exacte que le תוספות cite dans la source (hébreu + traduction). Elle s'affiche sans aller sur Sefaria, et fonctionnera hors ligne.
- `sources[].location` : la ligne exacte (comme « שורות 13-14 » dans les notes).
- `visualSummary.edges[].explanation` : une phrase sur la flèche (« pourquoi I fonde II.A.r »), au survol dans la carte.
- `synthesis.review[].segmentIds` : aujourd'hui les réponses contiennent « (s10-s11) » en texte ; un champ permettrait de cliquer pour aller au segment.

## 4. La relecture par un רב : le cycle « générer → relire → corriger → régénérer »

Aujourd'hui : on demande à une IA de produire le JSON, puis quelqu'un l'ouvre et demande des corrections à la main. L'objectif est qu'un רב puisse relire **dans l'UI**, sans jamais ouvrir le JSON, et que ses remarques reviennent à l'IA pour la version suivante.

### Décisions déjà prises

- Le רב fait toute la boucle lui-même : il commente dans l'UI, exporte le fichier de retours, le donne à l'IA (avec le JSON actuel), puis recharge le JSON corrigé dans l'UI. Le front ne modifie jamais le JSON.
- Les remarques sont gardées dans le navigateur (localStorage) et exportées en fichier. Pas de serveur.
- « Mode רב » : accessible à tous, sans connexion ni vérification.
- Le front prépare aussi un **prompt prêt à copier** pour l'IA : consignes + JSON actuel + remarques. Le רב n'a qu'à le coller.

### Ce que l'UI fait

1. Sur chaque segment, nœud, explication, traduction, terme ou table : un bouton « Commenter ».
2. Le רב choisit un type de remarque et écrit librement :
   - « Erreur » (ex. « רבה et non רבא »),
   - « À préciser » ou « Trop long »,
   - « Structure » (« ce segment appartient à IV.3 », « couper ici »),
   - « Question » (il ne sait pas, il demande),
   - « Validé ✓ ».
3. Une page « Relecture » liste toutes les remarques, avec leur avancement.
4. Bouton « Envoyer à l'IA » : l'UI produit un fichier de retours structuré (voir ci-dessous). Plus tard, elle pourrait appeler l'IA directement.
5. Quand la nouvelle version arrive, l'UI montre ce qui a changé (diff par segment) et, pour chaque remarque, comment elle a été traitée. Le רב valide ou rouvre.

### Fichier de retours proposé

```json
{
  "tosafotId": "bk56b-tosafot-behahi-hanaa",
  "baseVersion": "2026-11-17T10:00:00Z",
  "reviewer": "Rav X",
  "comments": [
    { "id": "c1", "target": { "segmentId": "s37", "field": "explanation.standard" },
      "type": "erreur", "quote": "le prêteur a accepté le gage comme paiement",
      "text": "Préciser que c'est l'explication de רש״י, pas celle des תוספות.",
      "status": "ouvert" },
    { "id": "c2", "target": { "nodeId": "IV" }, "type": "structure",
      "text": "IV.4 et IV.5 sont une seule réponse." }
  ]
}
```

Et dans le JSON régénéré, une réponse pour chaque remarque :

```json
"reviewLog": [
  { "commentId": "c1", "status": "corrigé", "change": "Ajout de « selon רש״י » dans s37.", "targets": ["s37"] },
  { "commentId": "c2", "status": "discuté", "answer": "Le תוספות les sépare par « ורב יוסף כי מוקי… » ; garder deux nœuds ?" }
]
```

Le front est construit. Les règles que l'IA doit suivre pour corriger (à ajouter à tes fichiers d'instructions) sont dans **`docs/REVIEW_LOOP.md`**. En résumé : le רב colle le prompt dans la conversation où tu as créé le JSON ; tu vérifies avec le skill `/daf` ; tu gardes les ids ; tu réponds à chaque remarque dans `reviewLog`.

### Questions pour toi

1. **Ids stables.** Si l'IA régénère tout, les ids (`s37`, `IV.4`) changent-ils ? Les remarques et les liens partagés en dépendent. Peux-tu garantir que les ids restent les mêmes d'une version à l'autre (et ne créer de nouveaux ids que pour de nouveaux segments) ?
2. **Régénération ciblée.** L'IA peut-elle ne refaire que les parties visées par les remarques, en laissant le reste identique ? C'est plus sûr pour le רב, qui n'a pas à tout relire.
3. **Entrée de la génération.** Comment lances-tu la génération aujourd'hui (un seul prompt, une chaîne d'étapes, quel modèle) ? Peut-elle recevoir en entrée : le texte source + la version précédente + le fichier de retours ?
4. **Versions.** Peux-tu ajouter `meta.version` (ou une date) et `meta.previousVersion`, pour que l'UI sache quelle version le רב a relue ?
5. **Réponses de l'IA.** Le format `reviewLog` te convient-il ? L'IA doit pouvoir répondre « je ne suis pas d'accord, parce que… » plutôt que d'appliquer une remarque fausse.
6. **Plusieurs relecteurs.** Faut-il prévoir plusieurs רבנים sur le même fichier, avec des avis différents ?

Dès que tu as répondu, le front peut commencer par les étapes 1 à 4 (commenter dans l'UI et exporter le fichier), qui ne dépendent pas de toi.

## Réponses du créateur du JSON (2026-11-17)

Tout est fait dans `data/bk56b_tosafot_behahi_hanaa.json` (`meta.version` = `2026-11-17T14:09:10Z`). `tools/check_tosafot.py` vérifie maintenant chaque nouveau champ.

### §1 Corrections
- **1.1 Termes** : j'ai séparé ou remplacé les termes, sans champ `match`. Règle : `term.he` est une suite continue de mots de `segment.he`. La ponctuation est ignorée, et le premier mot peut porter 1 ou 2 lettres préfixes (ו ד ה כ ל ב מ ש) : le terme `עוסק במצוה` correspond donc au texte `דעוסק במצוה`. Les termes d'un segment ne se chevauchent pas. Le script vérifie les 135 termes.
  - s20 : `בר משדה ענין ומחצה` (un seul terme) ;
  - s34 : `והא דבעי לאוקמא` ;
  - s37 : `גוביינא` retiré (il est dans le glossaire) ;
  - s38 : `לא קאי רבי אליעזר כוותיה` ;
  - aussi corrigés : s4 `בשביל ש־` → `בשביל`, et s5 `היכא ש־` → `היכא`.
- **1.2 ר״א** : `bySegment` est ajouté. Le script confirme que ר״א n'apparaît que dans s15, s34, s35 et s37.

### §2 Personnes
- Ajouts : `era`, `places`, `aliases`, `dates`, `teachers` / `students` / `colleagues`, `links`, `segmentIds` et `summary.essentiel`. Les segments ont `peopleIds`, et `people[].segmentIds` en est l'inverse exact (vérifié par le script).
- **Fiabilité** : je n'ai gardé une époque, un lieu ou des dates que si l'article Wikipédia hébreu (ou français, pour les dates) le confirmait. Sinon le champ est absent. Les dates manquent pour les תנאים et les אמוראים, pour qui elles seraient devinées.
- **Liens** : chaque URL Wikipédia a été vérifiée avec l'API (la page existe, ce n'est pas une page d'homonymie, et c'est la bonne personne). Les liens Sefaria `topics/...` ont été vérifiés avec l'API v2. Certains liens manquent faute de page sûre : fr pour רבה et רב נחמן, tout pour רב צמח גאון.
- `רבא` n'est **pas** dans les `aliases` de רבה : dans la Guemara, c'est une autre personne. Il est dans un champ séparé, `confusions: [{he, note}]`, qui sert à corriger la transcription du cours.
- **Images** : d'accord pour ne pas en mettre.

### §3 Autres liens
Ajoutés :
- `segments[].glossaryRefs` ;
- `glossary[].id` (`g-…`) ;
- `sources[].quote {he, fr, ref}` ;
- `sources[].location {sefariaRef, label, url}` ;
- `visualSummary.edges[].explanation` ;
- `synthesis.review[].segmentIds` (la parenthèse « (s10-s11) » est retirée du texte des réponses).

Chaque `quote.he` est la citation **exacte** du texte de Sefaria, sans voyelles. Les ״ ׳ sont normalisés, et la ponctuation éventuelle est gardée, comme les guillemets de la משנה de שבועות. Chaque `location.url` a été testée avec l'API Sefaria v3.

### §4 Relecture : réponses aux questions
1. **Ids stables** : oui. C'est la règle 3 de `REVIEW_LOOP.md`, et elle est vérifiée par `check_tosafot.py --previous ancien.json`. La vérification échoue si un id disparaît ou si `fullText` change.
2. **Régénération ciblée** : oui (règle 1). Si le prompt est collé dans la même conversation, l'IA modifie seulement les champs visés. Le diff du front et `--previous` permettent de le contrôler.
3. **Comment je génère** : une seule conversation avec un agent (Claude Opus) qui utilise le skill `/daf`. Il lit le texte et chaque source citée avec les scripts Sefaria, écrit le JSON par parties, puis lance le script de vérification. Il peut recevoir en entrée le texte source, la version précédente et le fichier de retours, c'est-à-dire exactement ce que contient le prompt du front.
4. **Versions** : `meta.version` est ajouté. `previousVersion` sera rempli à la première correction : c'est la `baseVersion` reçue.
5. **`reviewLog`** : le format convient. `refusé` et `discuté` permettent de ne pas appliquer une remarque fausse, avec la raison et la source (règle 6).
6. **Plusieurs relecteurs** : à décider par vous. Proposition simple : un fichier de retours par רב (`reviewer` est déjà dans le fichier), envoyés un par un à l'IA. Si deux remarques se contredisent, l'IA répond `discuté` aux deux. Le JSON n'a pas besoin de changer pour cela.
