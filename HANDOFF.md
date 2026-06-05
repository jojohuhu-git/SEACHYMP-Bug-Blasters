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

## Maintenance pass (2026-06-04) — DONE, uncommitted (awaiting review + commit)
Three deferred chores were applied in the working tree. `npm run build` and
`npm run lint` are both clean (0 problems). **Nothing is committed yet** — review
the diff, click-test the mutation flow, then commit.

1. **15 ESLint errors → all fixed.**
   - `no-unused-vars`: removed `_facingRight` (Level1) and dead `SEACHYMP_IDS` (Level3).
   - `react-hooks/refs`: `trackerRef.current.isMutated(...)` was read during render.
     Now snapshotted into a `capturedOrgMutated` state value at capture time (in the
     click/touch/keyboard capture handlers), and that state is passed as the `mutated`
     prop. Applies to Level1/2/3.
   - `react-hooks/immutability`: `tryCapture` converted to `useCallback` (declared
     before the effect that uses it); loop self-scheduling uses a `loopRef`.
   - One `eslint-disable-next-line react-hooks/immutability` was added in
     `Level2Scene.jsx` for a genuine canvas-state mutation (reduced-motion branch,
     ref-backed, not React state) — review whether you prefer a refactor.
   - **SPOT-CHECK NEEDED (no test suite):** mishandle a high-risk organism 3× with
     Ceftriaxone across Levels 1–3 → confirm the mutated form + "Ceftriaxone
     ineffective" messaging still fires. The mutated flag is now captured when the
     organism is grabbed rather than re-read each render (identical in normal play).
2. **README → rebranded to "SEACHYMP: Bug Blasters."** Corrected the 5-weapon list
   (removed Quinolones/TMP-SMX) to the real 3-weapon arsenal; Levels 2/3 now described
   as functional (16 cases); folder structure + deferred list corrected.
3. **CI actions bumped to Node-24-compatible majors** (`.github/workflows/deploy.yml`):
   `checkout@v6`, `setup-node@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`.
   `configure-pages@v5` and `node-version: 22` unchanged.

## Deferred / open items
1. **Next session: design overhaul (Track C)** — see plan below.
2. **`docs/.Rhistory`** is untracked clutter — add to `.gitignore` or delete.

## Track C — design overhaul (PLAN, not started)
Replace the placeholder emoji/colored-circle art with the illustrated reef art in
the storyboard (`~/Downloads/SEACHYMP design 2.png` master sheet + `design3.png`
screen-by-screen storyboard; `design.png` is OLDER — still shows 5 weapons, ignore
its arsenal). The codebase is built for this: "data drives everything, UI touches
nothing" + the `artToken` indirection means art swaps without touching game logic.

Suggested sequence (its own session):
1. **Lock the asset spec first.** `design 2.png` defines: 5 squad chymps
   (captain/scout/professor/deep-sea/ranger), ~11 organism creatures, 3 weapon icons,
   reef-restoration before/after, badges. Decide format (SVG vs PNG sprites) and the
   `/public` directory layout before drawing anything.
2. **Unify the render seam.** Organism art is read in `Level1Scene.jsx`'s
   `drawOrganism()` off `artToken`. Confirm Level2/Level3 read the same path; if not,
   unify so all art lands in one place. Highest-leverage prep step.
3. **Screen-by-screen, low-risk order:** static screens first (Title / SquadSelect /
   Encyclopedia / Weapons / MyReef badges) → then the canvas scenes (organisms +
   weapon firing) → then reef-restoration growth states. Each is independent.
4. **Two gotchas:** (a) every asset path must resolve under
   `base: '/SEACHYMP-Bug-Blasters/'` (use Vite's base, not hardcoded `/`) or Pages
   404s; (b) bitmap art can balloon the bundle (currently ~281 kB JS) — budget it.
5. **Storyboard ↔ code reconciliations to settle up front:** frame 14 shows *themed*
   weapon names (Blue Bubble Cannon, etc.) — decide if those are cosmetic labels over
   the 3 real antibiotics or dropped; ensure final art uses the 3-weapon arsenal
   (Ceftriaxone / Cefepime / Carbapenems), not the old 5.

## How to make rule changes
Edit `docs/RULES.md` (the adjudication sheet), fill Approved?/Change columns, then
apply across all surfaces and re-verify. See `CLAUDE.md` for the surface list and
the build/lint/walkthrough protocol.
