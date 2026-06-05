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

## Maintenance pass (2026-06-04) — DONE and COMMITTED
Three deferred chores. `npm run build` and `npm run lint` are both clean
(0 problems). **All committed** — ESLint fixes (`7be1fd5`), README rebrand +
Track C plan (`e387bea`), and the `configure-pages` CI bump (`8110432`).

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
its arsenal). The codebase follows "data drives everything, UI touches nothing,"
and the organism render seam is now built (see step 2) so organism art can be
swapped in one place via `artToken`.

Suggested sequence (its own session):
1. **Lock the asset spec first.** `design 2.png` defines: 5 squad chymps
   (captain/scout/professor/deep-sea/ranger), ~11 organism creatures, 3 weapon icons,
   reef-restoration before/after, badges. Decide the `/public` directory layout before
   drawing anything.

   **FORMAT DECISION — use PNG/WebP sprites for the illustrated art, not SVG**
   (recommended 2026-06-04 after reviewing `design 2.png`). The art is painterly,
   textured, gradient-heavy raster illustration — SVG is wrong for it (you'd either
   redraw every creature as vector and lose the texture, or auto-trace into bloated
   multi-thousand-path files that render slower and weigh more than a PNG). Specifics:
   - **Format:** WebP at ~2× display resolution (retina-crisp; ~25–35% smaller than
     PNG at equal quality).
   - **Location:** serve from `/public`, NOT bundled into JS. The ~281 kB budget is
     JS-only; art in `/public` loads as separate cacheable image requests and does not
     count against it. The real metric becomes total image download / request count —
     control it with a **sprite atlas** (one sheet, draw sub-rectangles) covering the
     ~11 organisms + 3 weapons.
   - **Mutation = canvas effect, NOT a second asset.** The render seam already passes
     `mutated`; apply a red tint + the existing 1.2× scale over the base sprite rather
     than authoring a separate "mutated" PNG per creature. Halves the organism asset
     count.
   - **SVG still fine for flat UI chrome** (badge icons, simple glyphs). Mix freely:
     raster for illustrated creatures/chymps, vector for flat icons.
2. **Render seam — DONE (2026-06-04, uncommitted in working tree).** Previously each
   level had its OWN copy of `drawOrganism()` and none actually read `artToken` (it
   was only a comment). The three copies are now unified into a single shared
   `src/logic/organismRenderer.js` exporting `drawOrganism(ctx, org, x, y, radius,
   mutated)` plus an `ART_REGISTRY` map keyed by `artToken`. The map is empty at boot,
   so every organism still renders the original colored-circle + monogram placeholder.
   To add real organism art later: register a renderer in `ART_REGISTRY[token]` — no
   scene/game-logic changes needed. (This seam covers the drifting canvas organisms
   only; static screens, weapon icons, and reef-growth art are still steps 1/3/4.)
3. **Screen-by-screen, low-risk order:** static screens first (Title / SquadSelect /
   Encyclopedia / Weapons / MyReef badges) → then the canvas scenes (organisms +
   weapon firing) → then reef-restoration growth states. Each is independent.
4. **Two gotchas:** (a) every asset path must resolve under
   `base: '/SEACHYMP-Bug-Blasters/'` (use Vite's base, not hardcoded `/`) or Pages
   404s; (b) total image download can balloon — see the PNG/WebP + atlas mitigations
   in step 1 (art lives in `/public`, so it does NOT count against the ~281 kB JS
   budget; the metric to watch is total image weight + request count).
5. **Storyboard ↔ code reconciliations to settle up front:**
   - Frame 14 shows *themed* weapon names (Blue Bubble Cannon, etc.). These already
     exist as cosmetic `nickname` fields in `src/data/weapons.js` — keep them as labels
     over the 3 real antibiotics.
   - **`design 2.png` itself still depicts the OLD 5-weapon arsenal** (TMP-SMX and
     Quinolones are pictured). Export ONLY the 3 real weapon icons (Ceftriaxone /
     Cefepime / Carbapenems); drop the TMP-SMX and Quinolones art — those drugs were
     removed from the game on 2026-06-04.

## How to make rule changes
Edit `docs/RULES.md` (the adjudication sheet), fill Approved?/Change columns, then
apply across all surfaces and re-verify. See `CLAUDE.md` for the surface list and
the build/lint/walkthrough protocol.
