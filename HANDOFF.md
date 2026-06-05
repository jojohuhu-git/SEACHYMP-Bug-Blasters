# SEACHYMP: Bug Blasters — Session Handoff

_Last updated: 2026-06-04_

## Current state
- Branch: `main`, tracking `origin` (`github.com/jojohuhu-git/SEACHYMP-Bug-Blasters`, public).
- **Live:** https://jojohuhu-git.github.io/SEACHYMP-Bug-Blasters/ (GitHub Pages,
  auto-deploys on push to `main` via `.github/workflows/deploy.yml`).
- Build: `npm run build` clean. Lint: 15 pre-existing errors remain (see Deferred).
- No test suite.

## Most recent work (2026-06-04) — RULES.md adjudication
Applied the clinician adjudications from `docs/RULES.md`. Commit `f834543`.

- **Removed TMP-SMX and Fluoroquinolones entirely.** Arsenal is now
  Ceftriaxone / Cefepime / Carbapenems (`src/data/weapons.js`).
- **Carbapenem stewardship rework** (`src/logic/weaponChoice.js`): carbapenem is now
  a *correct* ("acceptable") choice for **high-risk AmpC and mutated** organisms with
  reserve-it messaging; stays **reserve/incorrect** for low-risk.
- **Mutation simplified** (`src/logic/mutation.js`): `INEFFECTIVE_ON_MUTATED =
  ["ceftriaxone"]`. Mutated banners across Level2/3Scene, InfoCard, HowToPlay updated
  to single-drug phrasing.
- **Level 3 cases 20 → 16** (`src/data/cases.js`): removed 4 FQ-dependent cases
  (Citrobacter meningitis, Aeromonas gastroenteritis, both Yersinia). L3-9 Aeromonas →
  ceftriaxone. Hafnia bacteremia recast as intra-abdominal abscess / 4 days
  (source-controlled). Duration trims across remaining cases; rationales rewritten.
  Note: Yersinia now has no Level 3 case (still appears in Levels 1–2).
- **Encyclopedia text** (`src/data/organisms.js`): Aeromonas/Yersinia/Providencia
  reworded to only reference in-game drugs.
- **Lint:** cleared 8 stale eslint-disable comments via `--fix` (no logic change).

Verified by a full logic walkthrough: all Level 2 organism×weapon branches, the
mutation flow, and all 16 Level 3 case decisions match the new rules.

## Deferred / open items
1. **15 ESLint errors** in `src/screens/Level1Scene.jsx`, `Level2Scene.jsx`,
   `Level3Scene.jsx`:
   - `react-hooks/refs` — `trackerRef.current.isMutated(...)` read during render
     (Level1 ~526, Level2 ~758, Level3 ~883). Needs refactor to read in an
     effect/handler or component state.
   - `react-hooks/immutability` — `loop` / `tryCapture` accessed before declaration.
   - `no-unused-vars` — `_facingRight` (Level1 ~124), `SEACHYMP_IDS` (Level3 ~29,
     dead — completion uses `CASE_ORG_IDS`).
   These are React-correctness issues; test the mutation flow after fixing.
2. **README is stale** — still describes Level 2/3 as deferred and lists 5 weapons.
3. **CI uses Node 20 actions** — GitHub posted deprecation warnings (Node 20 EOL on
   runners Sept 2026). Bump action versions when convenient; non-blocking for now.
4. **Next planned session: design work** (per user).

## How to make rule changes
Edit `docs/RULES.md` (the adjudication sheet), fill Approved?/Change columns, then
apply across all surfaces and re-verify. See `CLAUDE.md` for the surface list and
the build/lint/walkthrough protocol.
