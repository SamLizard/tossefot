# front-agent : dossier de travail pour tout agent qui écrit du code front

Ce dossier est autonome. Il sert à n'importe quel agent (Kiro, Claude Code, Cursor, Codex…) qui doit
créer ou modifier du code Vue / Vuetify / TypeScript dans `../front/`. Il ne contient aucun code de
l'application et rien ici n'est importé par `front/`.

## Ordre de lecture

1. `../front/STANDARDS.md` : **les règles du projet** (source de vérité, non dupliquée ici).
2. `../docs/UI_SPEC.md` : la spécification de l'interface.
3. `WORKFLOW.md` : comment travailler (avant, pendant, après) et comment vérifier.
4. `GOTCHAS.md` : les pièges déjà rencontrés (Vuetify 4, i18n, hébreu, édition de fichiers sous Windows).
5. `TOOLS.md` : serveurs MCP, skills et outils qui rendent un agent plus fiable sur cette pile, avec
   ce qui est recommandé et ce qui ne l'est pas.
6. `mcp.example.json` : configuration MCP prête à copier (rien n'est activé tant qu'on ne la copie pas).

## Pile du projet (versions installées)

Vue 3.5, Vuetify 4.3, vue-router 5 (mode hash), vue-i18n 11, TypeScript strict, Vite 8.
Pas de Pinia, pas d'ESLint, pas de framework de test. Barrière de qualité : `npm run typecheck`.

## Règle d'or

Ne jamais écrire une prop, un slot ou une classe Vuetify de mémoire. Vuetify 4 diffère de Vuetify 3 et
la plupart des exemples en ligne (et dans les données d'entraînement) sont en v3. Vérifier d'abord, par
ordre de préférence :

1. le serveur MCP Vuetify (`get_component_api_by_version`) s'il est connecté ;
2. les définitions de types installées : `front/node_modules/vuetify/lib/components/<VComposant>/<VComposant>.d.ts` ;
3. la documentation officielle <https://vuetifyjs.com> (version 4).

## Règles globales

Les règles générales (Vuetify 4 vérifié avant d'écrire, blocs d'un `.vue`, 200 lignes, i18n, vérification
des types) sont aussi dans un fichier de steering global : `~/.kiro/steering/front-vue-vuetify.md`
(`inclusion: fileMatch` sur `*.vue`, `*.ts`, `*.tsx`). Il vaut pour tous les projets de la machine ; les règles
d'un projet (`STANDARDS.md`) passent avant. Ce fichier n'est pas dans le dépôt : sur une autre machine, le recopier.

## Utiliser ce dossier avec un agent qui ne le charge pas tout seul

- Kiro (agent par défaut) : il ne lit pas ce dossier automatiquement. Dire « lis `front-agent/README.md` »,
  ou ajouter un fichier de steering `.kiro/steering/front-agent.md` avec `inclusion: fileMatch` sur
  `front/**` et une ligne `#[[file:front-agent/README.md]]`.
- Agent Kiro personnalisé : les fichiers de steering et les skills ne sont pas chargés par défaut ; ajouter
  `"file://front-agent/**/*.md"` à ses `resources`.
- Autres agents : pointer vers ce `README.md` dans `AGENTS.md` ou `CLAUDE.md`.
