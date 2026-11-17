# Outils qui rendent un agent plus fiable sur Vue / Vuetify / TypeScript

Recherche faite le 17 novembre 2026. Rien de ce qui suit n'est installé ni activé par ce dossier.
« Lu » = la page officielle ou le README a été lu en entier. « Résumé » = seulement l'extrait d'un moteur
de recherche, à vérifier avant d'installer.

## Recommandé

| Outil | Sert à | Source | État de la vérification |
|---|---|---|---|
| **Vuetify MCP** (officiel) | API des composants par version, guide de migration v3 → v4, notes de version. Évite d'inventer des props de Vuetify 3. | <https://dev.vuetifyjs.com/getting-started/mcp/> | Lu |
| **Vue DevTools MCP** (officiel) | L'agent inspecte l'app en cours d'exécution : arbre de composants, état, routes. | <https://devtools.vuejs.org/guide/agents> | Lu |
| **Skill `vue-best-practices`** (équipe vuejs-ai) | Conventions Vue 3 + Composition API + TypeScript, pièges courants. 3,4 k étoiles, MIT. | <https://github.com/vuejs-ai/skills> | Lu |
| **Playwright MCP** (Microsoft) | L'agent pilote un vrai navigateur via l'arbre d'accessibilité : vérifier une vue, cliquer, lire le résultat. Remplacerait le Chrome piloté à la main de `scripts/smoke.mjs`. | <https://playwright.dev/docs/getting-started-mcp> | Résumé |

### Vuetify MCP

- Serveur hébergé, sans clé : `https://mcp.vuetifyjs.com/mcp`. Version locale (stdio) : `npx -y @vuetify/mcp`.
- Outils utiles ici : `get_component_api_by_version` (props, événements, slots d'un composant à une version),
  `get_v4_breaking_changes`, `get_feature_guide` (thème, grille, typographie), `get_release_notes_by_version`.
- Demander explicitement la version **4.3** : le projet utilise Vuetify 4.3.3.
- Le serveur hébergé reçoit les requêtes de l'agent (noms de composants, questions). Pour que rien ne sorte
  de la machine, utiliser la version stdio.

### Vue DevTools MCP : demande une dépendance, donc un accord

- Prérequis donnés par la doc : plugin Vite de Vue DevTools, Vite 8.3+ (le projet a 8.3.8) et
  `@vitejs/devtools` 0.7.6+. **Ni l'un ni l'autre n'est installé** : l'ajouter est une nouvelle dépendance
  (règle 14 de `STANDARDS.md`), à valider avant.
- Uniquement en développement. Un agent connecté peut lire tout l'état de l'application.
- Connecteur : `npx -y @vue/devtools-agent connect` (voir `mcp.example.json`, désactivé par défaut).

### Skill `vue-best-practices`

- Import dans Kiro : panneau « Agent Steering & Skills », `+`, « Import a skill », GitHub, URL d'un
  **sous-dossier** : `https://github.com/vuejs-ai/skills/tree/main/skills/vue-best-practices`.
  (L'URL exacte du dossier n'a pas été testée.) Autres agents : `npx skills add vuejs-ai/skills`.
- Le README du projet dit lui-même que c'est une expérience communautaire pouvant contenir des erreurs, et
  recommande de préfixer la demande par « use vue skill » pour que le skill se déclenche.
- C'est du texte qui oriente l'agent : le lire avant d'importer. En cas de conflit avec
  `../front/STANDARDS.md`, c'est `STANDARDS.md` qui l'emporte (200 lignes max, i18n, `HebrewText`…).
- Skills voisins du même dépôt : `vue-router-best-practices`, `vue-testing-best-practices`,
  `vue-debug-guides`, `create-adaptable-composable`. Pinia n'est pas utilisé ici : ne pas importer le skill Pinia.

## Utiles dans certains cas

| Outil | Quand | Remarque |
|---|---|---|
| **Vue Docs MCP** (`https://mcp.vue-mcp.org/mcp`, communautaire) | Questions sur Vue, vue-router, VueUse, Vite, Vitest. Couvre aussi Vue Flow, mais pas vue-i18n ni dagre. | Lu. Service hébergé par un tiers (licence FSL), les requêtes partent chez lui. Les benchmarks cités sont ceux de l'auteur. |
| **Context7** | Documentation à jour de n'importe quelle bibliothèque npm (vue-i18n, dagre, diff). | Résumé. La doc cite une clé d'API ; à vérifier avant d'adopter. |
| **Skills d'Anthony Fu** (`antfu/skills`) | Vite 8, Vitest, VueUse, conventions TypeScript. | Résumé. Les conventions sont personnelles ; en reprendre seulement ce qui ne contredit pas `STANDARDS.md`. |
| **ESLint MCP** (`npx @eslint/mcp@latest`) | Quand le projet aura ESLint. | Résumé. **Inutile aujourd'hui** : il n'y a pas de configuration ESLint dans `front/`. |

## Ce qui améliorerait le plus l'agent, sans rien installer

1. **Garder `npm run typecheck` obligatoire** : `vue-tsc` vérifie aussi les templates et a déjà attrapé les
   erreurs de la dernière migration. C'est le meilleur garde-fou actuel.
2. **Ajouter ESLint avec `eslint-plugin-vue` et `@intlify/eslint-plugin-vue-i18n`** (nouvelles dépendances,
   donc à valider). Le second signale les textes en dur (`no-raw-text`) et les clés manquantes : ça
   remplacerait le script de contrôle fait à la main pour la règle 6b.
3. **Ajouter Vitest** pour `src/utils/` (hébreu, abréviations, vérification d'intégrité, mise en page de la
   carte) : ce sont des fonctions pures, faciles à tester, et c'est là qu'une erreur silencieuse coûte le plus.
4. **Un fichier `AGENTS.md` à la racine** qui renvoie vers `front-agent/README.md` : Kiro et la plupart des
   agents le chargent automatiquement. Non créé ici pour que ce dossier reste indépendant.

## Ce que je ne recommande pas

- Les « super-skills » de plusieurs centaines de règles ou les collections qui regroupent des dizaines de
  skills : elles consomment du contexte et se contredisent. Un skill ne vaut que s'il apporte ce que le
  modèle ne sait pas déjà (méthode même du dépôt vuejs-ai).
- Les skills ou serveurs MCP d'origine inconnue, sans dépôt public ni mainteneur identifiable.
- Tout outil qui écrit dans le dépôt ou le navigateur sans demander. Garder l'approbation manuelle des
  outils qui modifient quelque chose (Playwright, édition d'état de Vue DevTools).
