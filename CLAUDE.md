# SEACHYMP: Bug Blasters — Claude Code Guidance

## What it is
A calm, no-fail educational React game teaching AmpC beta-lactamase stewardship.
Client-side only — no backend, no auth, no database. State persists to
`localStorage`. Built with **React 19 + Vite 8**.

SEACHYMP = the AmpC-producing gram-negatives:
**S**erratia · **E**nterobacter · **A**eromonas · **C**itrobacter · **H**afnia ·
**Y**ersinia · **M**organella · **P**rovidencia (+ Klebsiella aerogenes bonus).

Core teaching axis: **Cefepime (high-risk AmpC)** vs **Ceftriaxone (low-risk AmpC)**,
plus stewardship around reserving carbapenems and not over-treating non-AmpC reef
organisms.

## Setup
```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/  (dist is gitignored)
npm run lint     # ESLint
```
There is **no test suite**. Verify changes with `npm run build` + `npm run lint`
+ a manual click-through of Levels 1–3 (especially the mutation flow).

## Architecture
- **Data drives everything; UI touches nothing.** All clinical/game content lives
  in `src/data/`. Editing a rule should mean editing data, not components.
- `src/data/organisms.js` — SEACHYMP organisms + non-AmpC distractors; `riskTier`
  (`"high"` | `"low"`), `isSeachymp`, `teachingPoint`, `blurb`, `artToken`, `color`.
- `src/data/weapons.js` — antibiotic arsenal. **Currently 3 weapons:** Ceftriaxone,
  Cefepime, Carbapenems. (TMP-SMX and Fluoroquinolones were removed 2026-06-04.)
- `src/data/cases.js` — Level 3 clinical cases (16). Each has `correctDecision`
  (a weapon id), `infection`, `sourceControl`, `duration` (display-only), `rationale`.
- `src/data/progression.js`, `src/data/squad.js` — reef stages/badges, cosmetic chars.
- `src/logic/weaponChoice.js` — `classifyChoice(org, weaponId, mutated)`: the Level 2
  scoring engine. Returns `{ status, heading, feedback, isCorrect }`.
- `src/logic/mutation.js` — `MutationTracker` class + `MUTATION_THRESHOLD` +
  `INEFFECTIVE_ON_MUTATED`.
- `src/logic/gameState.js` — localStorage persistence.
- `src/screens/*` — one full-screen component per screen (Title, SquadSelect,
  HowToPlay, Level1/2/3Scene, Encyclopedia, MyReef, WeaponsScreen, InGameMenu).
- `src/components/` — InfoCard (capture decision card), HUD.
- `src/index.css` — CSS design tokens + global styles (edit here for palette).
- `App.jsx` — screen router / navigation state.
- `docs/RULES.md` — clinician-facing adjudication sheet: the code-accurate rule set
  with Approved?/Change columns. This is the workflow for rule changes (below).

## Vaccine/drug guidance priority
This is a stewardship teaching tool. Clinical rules should reflect **ACIP/IDSA/
guideline consensus**, not FDA package-insert minimums. When in doubt, prefer the
more current stewardship guidance and document the source in `docs/RULES.md`.

## Current rule set (as of 2026-06-04)
- **Arsenal:** Ceftriaxone, Cefepime, Carbapenems only.
- **Level 2 scoring (`classifyChoice`):**
  - Non-AmpC distractor → Release is correct; any antibiotic = overtreatment (wrong).
  - SEACHYMP organism + Release → wrong (needed treatment).
  - High-risk AmpC: Cefepime = preferred; Ceftriaxone = wrong; Carbapenem =
    **acceptable/correct** (with "reserve when possible" messaging).
  - Low-risk AmpC: Ceftriaxone = preferred; Cefepime = acceptable; Carbapenem =
    **reserve/incorrect**.
  - Mutated form (high-risk only): Ceftriaxone = ineffective/wrong; Cefepime =
    preferred; Carbapenem = acceptable/correct (mutated keeps `riskTier:"high"`).
- **Mutation:** triggered by 3 inappropriate Ceftriaxone calls on the SAME high-risk
  organism type. `INEFFECTIVE_ON_MUTATED = ["ceftriaxone"]`. Only high-risk types mutate.
- **Level 3:** 16 cases, scored as exact match to `correctDecision`. Durations are
  display-only context (not scored).

## The rule-change workflow (`docs/RULES.md`)
1. `docs/RULES.md` mirrors what the code currently enforces (Level 1/2/3 + mutation).
2. A clinician fills the **Approved?** (Y/N) and **Change to / Notes** columns.
3. Claude applies every adjudication in one pass across all surfaces, then
   re-verifies with `npm run build` + `npm run lint` + manual walkthrough.
4. Keep `docs/RULES.md` (including the header `Cases:` count) in sync after changes.

When changing a drug rule, update **every** surface that references it:
`weaponChoice.js`, `cases.js`, `weapons.js`, `mutation.js`, `organisms.js`
(encyclopedia text), the scene banners (`Level2Scene`, `Level3Scene`), `InfoCard`,
and `HowToPlay`. Then grep `src/` to confirm no stale drug references remain.

## Deploy
**No remote and no deploy pipeline are configured** (local-only repo; no
`.github/workflows`, no gh-pages/Netlify/Vercel config; `dist/` gitignored;
`vite.config.js` uses the default base). To publish, a hosting target must be set
up first (e.g. GitHub repo + Pages with `base` set in `vite.config.js`, or
Netlify/Vercel). Until then, "deploy" = `npm run build` + serve `dist/` locally
(`npm run preview`).

## Known follow-ups
- **15 ESLint errors deferred** (`react-hooks/refs`, `react-hooks/immutability`,
  `no-unused-vars`) in Level1/2/3Scene.jsx — refs read during render need a manual
  refactor. Auto-fixable warnings were already cleared.
- README is partly stale (still says Level 2/3 are "deferred" and lists 5 weapons).
