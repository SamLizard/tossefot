# Corriger un JSON après la relecture d'un רב

À ajouter aux instructions de l'IA qui génère les fichiers `data/*.json`.
Le front (`front/`) ne modifie jamais le JSON : il sert au רב à expliquer ce qu'il faut changer.

## Le cycle

1. L'IA génère le JSON dans une conversation, avec le skill `/daf` pour lire les sources.
2. Le רב ouvre le JSON dans l'interface, active « Mode relecture » (menu ⋮) et commente les segments, nœuds et tables.
3. Sur la page « Relecture », il clique « Copier le prompt pour l'IA » et le **colle dans la même conversation**. (Nouvelle conversation : il joint aussi le JSON, bouton « Télécharger le JSON actuel ».)
4. L'IA rend le JSON corrigé complet, avec un `reviewLog`.
5. Le רב le charge dans l'interface (« Charger un JSON corrigé »). L'interface vérifie le texte, applique le `reviewLog` aux remarques et montre ce qui a changé. Il valide ou rouvre chaque remarque, et recommence si besoin.

## Ce que l'IA reçoit

Le prompt contient les consignes, puis chaque remarque sous deux formes : une liste lisible et le même contenu en JSON :

```json
{
  "tosafotId": "bk56b-tosafot-behahi-hanaa",
  "baseVersion": "…",
  "reviewer": "…",
  "comments": [
    { "id": "c1",
      "target": { "segmentId": "s37", "field": "explanation.standard" },
      "type": "erreur",
      "quote": "le prêteur a accepté le gage comme paiement",
      "text": "Préciser que c'est l'explication de רש״י.",
      "status": "envoye" }
  ]
}
```

- `target` : `segmentId`, `nodeId` ou `tableId`. Le `field` est optionnel : `he`, `translation`, `explanation.essentiel|standard|approfondi`, `terms`, `notes`, `sourceIds` pour un segment ; `title`, `summary`, `conclusion`, `structure` pour un nœud.
- `type` : `erreur`, `preciser`, `structure`, `question`, `valide`.
- `quote` : le passage que le רב avait sélectionné (optionnel).

## Règles de correction

1. **Ne changer que ce que demandent les remarques.** Tout le reste reste identique, à l'octet près si possible.
2. **Vérifier avec `/daf`** chaque correction dans les sources (Guemara, רש״י, תוספות, ראשונים, sources citées). Ne rien inventer. Si une vérification est impossible, répondre `discuté` et dire ce qui manque.
3. **Ids stables.** Ne jamais renommer ni renuméroter `s1…`, `I`, `II.A…`, les ids de tables, de sources ou de personnes. Un nouvel id seulement pour un élément nouveau. Les remarques et les liens partagés en dépendent.
4. **Le texte ne change pas.** `source.fullText` ne bouge jamais. Les `he` des segments, mis bout à bout, doivent toujours reproduire `fullText` mot à mot. Pour couper ou fusionner des segments : mettre à jour `structure[].segmentIds` et `nodeId`, puis vérifier avec `python tools/check_tosafot.py <fichier> --sefaria tools/raw_bk56b_10.txt`.
5. **Hébreu :** garder ״ et ׳, pas de phonétique.
6. **Désaccord argumenté.** Si une remarque paraît fausse, ne pas l'appliquer : `refusé` ou `discuté`, avec la raison et la source. Une correction fausse est pire qu'un désaccord.
7. **Types de remarque :**
   - `question` : répondre dans `answer` ; ne modifier le JSON que si la réponse l'exige ;
   - `valide` : ne pas toucher le passage ; ne pas mettre d'entrée dans `reviewLog` (rien à répondre) ;
   - `structure` : peut toucher `structure`, `segments[].nodeId`, `visualSummary.edges` et `structureCorrections`.
8. **Versions.** `meta.previousVersion` = la `baseVersion` reçue ; `meta.version` = nouvelle date ISO.
9. **Sortie :** le JSON complet et valide, sans texte autour (ni extrait ni diff).

## Répondre à chaque remarque : `reviewLog`

À la racine du JSON, une entrée par remarque reçue (sauf `valide`) :

```json
"reviewLog": [
  { "commentId": "c1", "status": "corrigé", "change": "Ajout de « selon רש״י » dans s37 (explication standard).", "targets": ["s37"] },
  { "commentId": "c2", "status": "discuté", "answer": "Le תוספות sépare IV.4 et IV.5 par « ורב יוסף כי מוקי… » ; je propose de garder deux nœuds.", "targets": ["IV.4", "IV.5"] },
  { "commentId": "c3", "status": "refusé", "answer": "Le texte de Sefaria a bien « שתיהם » (s4).", "targets": ["s4"] }
]
```

- `status` : `corrigé`, `discuté` ou `refusé`.
- `change` (si corrigé) ou `answer` (sinon) : en français, termes en hébreu, une ou deux phrases que le רב comprend sans ouvrir le JSON.
- `targets` : les ids réellement modifiés ou concernés.
- Le `reviewLog` d'une version précédente peut être remplacé : seules les réponses aux remarques reçues dans ce prompt comptent.

## Avant de rendre

- [ ] Chaque remarque (sauf `valide`) a une entrée dans `reviewLog`.
- [ ] Aucun id existant n'a changé.
- [ ] `check_tosafot.py <nouveau> --sefaria tools/raw_bk56b_10.txt --previous <ancien>` passe (texte complet, structure, références, ids stables).
- [ ] `meta.version` et `meta.previousVersion` sont à jour.
