# TODO

## Résumé du שיעור (vue « Cours »)

- [ ] Écrire un résumé du cours enregistré (`notes/Transcription du cours.md`, fichiers `.srt` et `.csv` dans `notes/attachements/`). Le cours ne couvre que la fin du תוספות (parties IV et V de la structure).
- [ ] Format proposé : un fichier `data/bk56b_shiur_<date>.json` séparé, relié au תוספות par les `nodeId` / `segmentId` :
  - chapitres (depuis le `.csv` : titre, début en secondes) ;
  - pour chaque chapitre : résumé, nœuds/segments concernés, exemples du rabbin (la montre de 100 ₪ sur 10 000 ₪, le téléphone, le passeport, la photo de famille), questions des élèves ;
  - lien vers l'enregistrement audio avec horodatage, si on peut l'héberger.
- [ ] Dans l'UI : une vue « Cours », ou un badge « 🎧 expliqué au cours (14:44) » sur les nœuds et segments concernés.
- [ ] Corriger les erreurs de la transcription automatique avant de résumer : « רבא » est souvent écrit à la place de « רבה » ; « רבי ישמעאל » à 14:44 désigne ר׳ אליעזר ; « רב שמואל » désigne רב יוסף.
- [ ] Faire relire la structure (`structure` et `structureCorrections` dans le JSON) par le rabbin, surtout la partie IV.

## PWA hors ligne

Le front est déjà prêt pour la plus grande partie : routeur en mode hash (pas de serveur nécessaire), JSON de `data/` et polices inclus dans le build. Reste à faire :

- [ ] Ajouter `vite-plugin-pwa` (compatible Vite 8) : service worker Workbox en `generateSW`, précache de tous les assets (JS, CSS, polices, chunks JSON), `registerType: 'prompt'` avec un `v-snackbar` « Nouvelle version disponible ».
- [ ] Manifest : nom, icônes (générer avec `@vite-pwa/assets-generator`), `theme_color` = `#1e3a5f`, `background_color` = `#f7f3ea`, `lang: fr`.
- [ ] Alléger les icônes : `@mdi/font` pèse 1,3 Mo (toutes les icônes) ; passer à `@mdi/js` (SVG, seulement celles utilisées) avant de mettre en cache.
- [ ] « Comparer avec Sefaria » et les liens Sefaria : afficher « hors ligne » au lieu d'échouer (`navigator.onLine`).
- [ ] Option : charger des JSON locaux choisis par l'utilisateur (`<v-file-input>` → IndexedDB), pour lire un nouveau תוספות sans rebuild.

## À réfléchir après le MVP (schéma JSON)

Idées retirées de `JSON_IDEAS.md` (qui ne garde que le MVP). À rediscuter plus tard :

- [ ] `structure[].difficulty` (1-3) : signaler les passages difficiles.
- [ ] `meta.prerequisites[]` : autres תוספות / סוגיות à connaître avant (liens vers d'autres fichiers du catalogue).
- [ ] `meta.related[]` : תוספות parallèles (ex. ב״מ כט. ד״ה והוי), avec le `slug` du catalogue si le fichier existe.
- [ ] `shiurim[]` dans un fichier séparé, ou `segments[].shiur: { file, start, end }` pour un badge « 🎧 14:44 » (voir la section « Résumé du שיעור » ci-dessus).
- [ ] `segments[].questions[]` : question de compréhension par segment, pour un mode « quiz ».
- [ ] Technique :
  - [ ] utiliser `meta.schemaVersion` : refuser ou avertir si la version n'est pas supportée ;
  - [ ] publier un JSON Schema (`data/tosafot.schema.json`) pour valider les fichiers dans l'éditeur et dans `check_tosafot.py` ;
  - [ ] `meta.updatedAt`, `meta.authors` (utile pour la PWA et la relecture).

## Personnes communes à tout le site

Les mêmes רבנים (רבה, רב יוסף, ר״י, רש״י…) reviennent dans chaque תוספות. Aujourd'hui chaque JSON répète leur fiche.

- [ ] Créer un fichier commun (ex. `data/people.json`) avec la partie stable de chaque fiche : `name`, `full`, `type`, `era`, `places`, `dates`, `aliases`, `confusions`, `teachers` / `students` / `colleagues`, `links`, `summary`.
- [ ] Dans chaque תוספות, ne garder que ce qui lui est propre : `segmentIds`, et une note éventuelle sur le rôle de la personne dans ce passage.
- [ ] Ids identiques partout (`rabba`, `rav-yosef`…) : à fixer avec le créateur du JSON, et à vérifier dans `check_tosafot.py`.
- [ ] Front : fusionner la fiche commune et la partie locale dans `useTosafot` (`person(id)`), sans changer les composants.
- [ ] Plus tard : une page « Personnes » du site, avec la liste des תוספות où chacun apparaît.

## Autres

- [x] Porter `tools/check_tosafot.py` en TypeScript pour le bouton « Vérifier le texte » (`front/src/utils/integrity.ts`).
- [ ] Voir les idées d'évolution du schéma JSON dans `docs/JSON_IDEAS.md`.
- [ ] Vérifier les textes de ר״ח et de בה״ג (absents de l'archive Sefaria), et du רא״ש / טור sur ce point.
