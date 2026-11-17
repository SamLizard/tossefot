# Comment travailler sur le front

## Avant de coder

1. Lire `../front/STANDARDS.md`. Retenir surtout : 200 lignes max par `.vue`, `<template>` en premier,
   aucun texte d'interface en dur (vue-i18n), `HebrewText` pour tout texte pouvant contenir de l'hébreu.
2. Chercher l'existant avant de créer : la table « Socle existant » de `STANDARDS.md` liste les utilitaires,
   composables et composants à réutiliser. Faire une recherche dans `front/src/` avant d'écrire une fonction.
3. Pour toute API Vuetify, vérifier la version 4 (voir la règle d'or dans `README.md`).
4. Pour une bibliothèque hors Vue/Vuetify (vue-i18n, dagre, diff, vue-router), consulter sa documentation
   ou ses types dans `node_modules` plutôt que de se fier à la mémoire.
5. Si la demande touche plus d'un composant, annoncer le découpage en fichiers avant d'écrire.

## Pendant

- Un composant par fichier, sous 200 lignes (viser 150). Au-delà : sous-composants dans le même dossier,
  logique réutilisable dans `src/utils/` (fonctions pures) ou `src/composables/` (état réactif).
- Ne pas refactorer les gros composants existants sans demande. Ne pas ajouter de dépendance sans accord.
- Chaque texte visible, `aria-label`, `title`, `label`, message d'erreur : une clé dans
  `src/i18n/locales/fr.json`. Une table de données porte une clé (`labelKey`), pas un libellé.
- Toute couleur de fond vient du thème et a sa couleur « on-… » (règle 7c).
- Faire des modifications petites et ciblées, et relire le diff (`git diff`) quand on édite plusieurs fichiers.

## Après (obligatoire avant de rendre la main)

Depuis `front/` :

| Étape | Commande | Attendu |
|---|---|---|
| Types et templates | `npm run typecheck` | aucune erreur |
| Clés i18n | chaque clé utilisée existe dans `fr.json` | aucune clé manquante |
| Taille | aucun `.vue` au-dessus de 200 lignes | ok |
| Test de fumée | `npm run dev -- --port 5199`, puis `node scripts/smoke.mjs` avec `BASE=http://localhost:5199/#/bk56b_tosafot_behahi_hanaa/` | toutes les vues avec du texte, « Aucune erreur console » |
| Contraste | `npm run preview` puis `node scripts/contrast.mjs` | OK partout (si on touche aux couleurs) |

Notes :

- `npm run build` et le déploiement ne font pas partie de la vérification courante : ne les lancer que sur demande.
- Ne jamais lancer un serveur de développement en commande bloquante : le démarrer en tâche de fond, puis l'arrêter.
- Le premier passage du test de fumée sur un serveur de développement froid peut afficher `texte=0` pour les
  premières vues (optimisation des dépendances). Relancer une fois avant de conclure à une erreur.
- `scripts/contrast.mjs` a l'URL `localhost:4173` en dur (preview), contrairement à `smoke.mjs`.

## Pousser

Commit en français ou en anglais selon l'historique (`git log`), message court qui dit le pourquoi.
Vérifier la branche, le remote et le compte avant de pousser (`git remote -v`, `gh auth status`).
Ne jamais forcer un push ni réécrire l'historique sans demande.
