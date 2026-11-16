# Tossefot: guided reading of a Tosafot

A web app that walks a learner through a single Tosafot, sentence by sentence, with three explanation levels (essential, standard, in depth), a structure view, a continuous-text view, an argument map, a glossary and a text-integrity check against Sefaria.

**Live site:** https://samlizard.github.io/tossefot/

Currently included: Tosafot on Bava Kamma 56b, s.v. *בההיא הנאה דלא קבעי למיתב ריפתא לעניא*.

> ## ⚠️ AI-generated content, not reviewed by a Rav
>
> The explanations, structure, argument map, glossary, translations and review questions in this project were produced with an AI. **They have not yet been verified by a Rav or a qualified Torah scholar** and may contain mistakes.
>
> Do not rely on this material for halachic decisions. Use it as a study aid, and check it against the original sources. If you find an error, please open an issue.

## How the content is made: the `/daf` skill

The explanations are produced by an AI assistant that has the **`/daf` skill** installed. Without the skill, the AI has no tool to fetch the Gemara, Rashi and Tosafot text from Sefaria, and its answers are not grounded in the source text.

The skill is an open-source project by Adam Blumenthal: https://github.com/adblumenthal/Daf (MIT licence). It is a folder of instructions plus small Python scripts. It needs no account, API key or network settings. It reads Sefaria's public text export, and it computes the Daf Yomi calendar offline.

### Add the skill

**Claude (web or desktop app)**
1. Download `daf.skill` from the [releases page](https://github.com/adblumenthal/Daf/releases/latest).
2. Open Settings, then Capabilities, then Skills, and upload `daf.skill`. (Menu names change between versions.)
3. Start a new chat and type `/daf yomi` to check that it works.

**Claude Code, Kiro, or another local agent**
1. Download the source zip from the [releases page](https://github.com/adblumenthal/Daf/releases/latest) and unzip it. The folder must contain `SKILL.md` at its top level.
2. Copy the folder into your agent's skills directory, named `daf`:
   - Claude Code: `~/.claude/skills/daf`
   - Kiro (per project): `<your project>/.kiro/skills/daf`
3. Start a new session and type `/daf yomi`.

**ChatGPT**
ChatGPT has no skills system, so you attach the files to a Project instead. Follow the ChatGPT section of the skill's [INSTALL.md](https://github.com/adblumenthal/Daf/blob/main/INSTALL.md). Live Sefaria access depends on ChatGPT's browsing, so results are less reliable than with Claude or Kiro.

The skill needs Python 3 on the machine where the agent runs.

### Generate a Tosafot explanation

With the skill installed, ask for the Tosafot layer of an exact daf, for example:

```
/daf Bava Kamma 56b tosafot advanced
```

Other useful modifiers are `deep`, `rashi`, `rishonim`, `halacha` and `beginner`. The AI's answer is then structured into the JSON format described in [`docs/UI_SPEC.md`](docs/UI_SPEC.md) (section 10) and typed in [`front/src/types/tosafot.ts`](front/src/types/tosafot.ts). Ideas for extending the format are in [`docs/JSON_IDEAS.md`](docs/JSON_IDEAS.md). The file is validated with `tools/check_tosafot.py` (see below).

## Repository layout

```
front/    Vue 3 + Vuetify 4 + TypeScript app (Vite)
data/     One JSON file per Tosafot (the app lists every file in this folder)
docs/     UI specification, JSON schema ideas, TODO
tools/    check_tosafot.py (validates a Tosafot JSON file) and the raw Sefaria text it compares against
```

## Run the app locally

Requires Node.js.

```
cd front
npm install
npm run dev        # http://localhost:5173
```

Other commands (all from `front/`):

| Command | What it does |
| --- | --- |
| `npm run build` | Type-checks, then builds into `front/dist/` |
| `npm run preview` | Serves the built site on http://localhost:4173 |
| `npm run deploy` | Builds, then publishes `front/dist/` to the `gh-pages` branch |

See [`front/README.md`](front/README.md) for the front-end code organisation.

## Add a Tosafot

1. Put a new JSON file in `data/`, following the same schema as the existing one.
2. Validate it:
   ```
   python tools/check_tosafot.py data/<file>.json
   ```
   The check confirms that the JSON is valid, that the segments concatenate exactly to the source text, and that every reference points to an existing node.
3. Run the app. The new file appears in the catalogue automatically.

## Deployment (GitHub Pages)

The site is published with the [`gh-pages`](https://www.npmjs.com/package/gh-pages) npm package. `npm run deploy` runs the build, then pushes `front/dist/` to the `gh-pages` branch. In the repository settings, Pages is set to serve from that branch.

The app uses hash-based routes (`#/...`) and relative asset paths, so it works under `/tossefot/` without server configuration.

## Sources and attribution

- The Hebrew text of the Tosafot, and the texts it cites, come from [Sefaria](https://www.sefaria.org) (GitHub export, March 2026; Vilna edition). Sefaria texts have their own licences, which are listed on each text's page on sefaria.org.
- The `/daf` skill is by [Adam Blumenthal](https://github.com/adblumenthal/Daf), MIT licence. It is not included in this repository.
- Explanations were written by an AI. See the warning at the top of this file.

## Licence

No licence has been chosen yet. Until one is added, all rights are reserved by the author.
