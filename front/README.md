# Front : lecture guidée d'un תוספות

Vue 3 + Vuetify 4 + TypeScript. Spécification : `../docs/UI_SPEC.md`. Règles de code : `STANDARDS.md`.

```
npm install
npm run dev        # développement (http://localhost:5173)
npm run build      # vérification des types + build dans dist/
npm run preview    # sert dist/ (http://localhost:4173)
node scripts/smoke.mjs   # test de fumée (avec preview lancé) : toutes les vues + « Vérifier le texte »
```

Les תוספות sont lus dans `../data/*.json` (un fichier = un תוספות, même schéma). Ajouter un fichier suffit pour qu'il apparaisse dans le catalogue.

## Organisation

```
src/
  types/        schéma du JSON
  utils/        fonctions pures (hébreu, niveaux, abréviations, vérification, carte)
  composables/  état partagé (document, préférences, panneau, URL)
  data/         catalogue des JSON
  pages/        TosafotPage (chargement), TosafotReader (mise en page), CatalogPage
  components/
    common/     HebrewText, LevelSelector, RoleChip, PersonCard
    layout/     en-tête, onglets, menu, préférences
    segment/    carte, panneau latéral, texte hébreu avec infobulles
    structure/  vue Structure
    text/       vue Texte continu
    map/        vue Carte d'arguments (dagre + SVG)
    views/      Contexte, Synthèse, Glossaire, Notes de préparation
    tables/     tables et modale
    integrity/  bouton « Vérifier le texte »
```
