# SEACHYMP: Bug Blasters — Session Handoff

> **⚠ SUPERSEDED (2026-08-13).** Do not resume from this file. The work it describes was
> committed as `09497b8` and is finished. The live handoff is
> [docs/archive/handoff-2026-08-13-special-effects.md](docs/archive/handoff-2026-08-13-special-effects.md),
> which covers the special-effects overhaul (items 1–4 done but **uncommitted**, item 5 not
> started). This file is kept only as history.

_Last updated: 2026-08-12_

## Current state
- Branch: `main`, tracking `origin` (`github.com/jojohuhu-git/SEACHYMP-Bug-Blasters`, public).
- **Live:** https://jojohuhu-git.github.io/SEACHYMP-Bug-Blasters/ (GitHub Pages,
  auto-deploys on push to `main` via `.github/workflows/deploy.yml`).
- Build: `npm run build` clean. Lint: **clean (0 problems)**. No test suite.
- The illustrated sea-creature art is live on the canvas and all HTML surfaces; Captain
  has gun/net poses; mutation + kill effects are animated. See CLAUDE.md →
  "Illustrated creature art" for the full architecture.
- **Uncommitted (2026-08-12):** denser reef stages, more dramatic mutation/kill
  effects, a fish-direction bug fix, humpback whales, 3 organism art/text fixes, and
  weapon-specific firing poses. See "Most recent work" below — not yet committed/pushed.

## Most recent work (2026-08-12, part 4) — gun pose duration
- `GUN_DUR` in `src/logic/playerRenderer.js` bumped from 0.35s to 1.0s so the
  weapon-specific pose (see part 3 below) actually has time to read before the shot
  resolves — 0.35s was too brief to see which weapon was drawn. 1.0s stays comfortably
  under the ~1.1-1.4s window before the result card reappears (shot flight ~0.83s +
  kill/mutate/pulse effect ~0.3-0.55s), so it isn't cut off early in the common cases.
  Verified live — could now catch the pose in an ordinary screenshot with no timing
  hacks needed (unlike the part 3 verification, which had to temporarily slow the
  animation to catch a frame at the old 0.35s duration). Also fixed a stray leftover
  comment artifact on that line from earlier editing (`// seconds before commit`) that
  didn't reflect any real state — just cleaned up while touching the line.

## Most recent work (2026-08-12, part 3) — weapon-specific firing poses
- The Captain's "gun" pose (`src/logic/playerRenderer.js`) previously drew one generic
  amber gun regardless of which antibiotic was chosen. Now it draws the actual weapon:
  - **Ceftriaxone → Blue Bubble Cannon** (`drawBubbleCannon`): stubby rounded barrel,
    bell-mouth muzzle, puffs a small cluster of rising bubbles instead of a spark flash.
  - **Cefepime → Purple Electric Harpoon** (`drawElectricHarpoon`): long barbed shaft,
    jagged purple electric-arc discharge at the tip.
  - **Carbapenem → Golden Anchor Launcher** (`drawAnchorLauncher`): heavy banded barrel
    with a small anchor icon at the muzzle, bigger/slower golden burst.
  - Recoil kick is now sized per weapon (`WEAPON_RECOIL`: bubble cannon lightest,
    anchor launcher heaviest) so the heavier weapon visibly kicks the diver back
    further — part of making it read as "natural."
  - `triggerPose(state, "gun", tx, ty, weaponId)` gained a `weaponId` param; wired
    through both call sites (`Level2Scene.jsx`, `Level3Scene.jsx`). A generic-gun
    fallback (`drawGenericGun`) still exists if `weaponId` is ever missing.
- **Verified:** `npm run build` + `npm run lint` clean, no console errors. Live-checked
  by temporarily stretching the pose/shot/fade timing constants (reverted after — see
  the clean `grep -rn "TEMP for visual QA"` check) to catch a frame mid-animation:
  confirmed the Purple Electric Harpoon renders correctly in hand with its electric-arc
  muzzle effect and a purple projectile in flight. The other two weapons share the same
  dispatch path (`WEAPON_RENDERERS[weaponId]`) and were not independently screenshotted
  this session — low risk given the shared, lint/build-clean mechanism, but worth a
  quick visual glance next session before considering this fully closed.

## Most recent work (2026-08-12, part 2) — organism art review + 3 fixes
- Reviewed all 22 organism sprites directly against their blurb text/name (most
  blurbs were already flagged stale in `docs/RULES.md` from before the art swap).
  Found one real name/art mismatch and one clean swap opportunity; applied both:
  - **`reef_clownfish` renamed to "Dumbo Octopus"** — its art was always
    `dumbo-octopus.webp` (never a clownfish), and no clownfish-style fish art exists
    in the library to swap in instead. Renamed to match the art, same pattern as the
    earlier `starfish`→"Coral" / `friendly_crab`→"Friendly Clam" fixes. Blurb + emoji
    (🐠→🐙) + color updated to match; `id` kept as `reef_clownfish` for save-compat.
  - **Swapped `saureus` ↔ `spneumoniae` art tokens** (`nomad-jellyfish` ↔
    `tiger-cowrie`). Strep pneumoniae's blurb says "a pair of... shells" — it now
    gets the actual shell art instead of a jellyfish. Staph aureus's "coral polyps"
    blurb was never a great fit for either asset, so this is a lateral move for it and
    a clear improvement for Strep pneumoniae. Blurbs + colors updated to match the new
    art on both.
  - All other mismatched organisms (K. pneumoniae/nautilus, P. mirabilis/mimic-octopus,
    P. penneri/sand-dollar, E. faecium/manta-ray) have no better-fitting asset left in
    the closed 22-sprite pool (all fish-shaped art is already claimed by real SEACHYMP
    organisms) — left as-is, still flagged in `docs/RULES.md`.
  - `docs/RULES.md` updated to match (the three entries' art/blurb/name + the
    distractor-tier table row).
- **Verified:** `npm run build` + `npm run lint` clean. Live-checked the Encyclopedia
  screen (localStorage `bugblasters_encyclopedia` temporarily patched to include the
  three changed organisms for testing) — all three render with matching art/name/blurb.
  No console errors.

## Most recent work (2026-08-12) — denser reef, dramatic mutation/kill effects
- **Reef population** (`src/logic/reefRenderer.js`): added `drawJellyfish` (pulsing
  bell, trailing tentacles) and `drawRay` (gliding, flapping wings) as new decorative
  reef life. Bumped `STAGE[]` counts at every stage except barren — sprouting/growing/
  thriving all read noticeably fuller (e.g. thriving: 12→18 fish, 5→7 shells, 3→4
  seahorses, plus 3 jellyfish + 1 ray). Live-verified at the Thriving stage.
- **Mutation effect, more dramatic** (`src/logic/organismRenderer.js`): bigger glow
  halo (radius/alpha both increased), stronger shake, more ember particles (6→10) plus
  a new second particle type (short red spark/crack lines). Mutation flash ring
  (`src/logic/shotAnimation.js` `drawOrganismEffects`) now has a second, wider, fainter
  orange trailing ring. `applyMutateFlash` slowed (0.06→0.045/frame) so the burst reads
  longer.
- **Kill explosion, more dramatic** (`src/logic/organismSprites.js`
  `drawKillExplosion`): more debris shards (10→16, thrown farther), a new spark-streak
  particle type, a second colored ring trailing the white burst ring (color
  escalation), more bubbles (6→9), longer/brighter flash. `applyKillEffect` slowed
  (0.045→0.03/frame) for a longer burst.
- **New: level-wide screen shake + flash** (`src/logic/screenEffects.js`, new file) —
  a brief camera shake + full-canvas color flash (white on kill, red on mutate) wired
  into both `Level2Scene.jsx` and `Level3Scene.jsx` (Level 1 has no shooting animation,
  so it's untouched). Fully skipped under `prefers-reduced-motion` — verified the gate
  is intact (`triggerScreenEffect` checks `prefersReducedMotion()` before doing
  anything, matching the existing per-organism reduced-motion convention).
- **Verification:** `npm run build` and `npm run lint` both clean. Live-walked Level 2
  at the Thriving reef stage (localStorage `identifiedCount` bumped to 8 for testing):
  confirmed jellyfish/ray/denser coral render, a real kill (Klebsiella aerogenes +
  Cefepime) plays through with the result card still correctly deferred until the
  canvas effect finishes (`pendingRevealRef` timing untouched), and a real mutation
  trigger (3x wrong Ceftriaxone on Citrobacter freundii) fires the mutation banner with
  no console errors. Level 3 loads and renders cleanly with the same wiring (not
  click-tested end-to-end this session — same shared code path as Level 2).
- **Not done:** did not commit or push. Next session (or later this one): review the
  diff, commit, and deploy per the repo's normal flow if the owner is happy with the
  effects.

## Most recent work (2026-06-11) — creature art, animations, mutated rule, docs
- **Creature sprites** replace the placeholder circles/monograms everywhere. 22 WebP
  sprites in `public/art/organisms/`; canvas via `organismSprites.js` + `organismRenderer.js`;
  HTML via `OrganismImage.jsx` (InfoCard, Encyclopedia, L2/L3 cards).
- **Procedural animations:** mutation (red glow/tint/shake/embers) and kill explosion
  (flash/debris/bubbles/ring). Result card now defers until the effect finishes
  (`pendingRevealRef`) so the explosion is visible.
- **Captain poses:** `playerRenderer.triggerPose` — gun (muzzle+recoil) on fire, net on
  capture (L2/L3). L1 keeps its own net flourish.
- **Mutated drug rule changed → Cefepime and carbapenem are CO-EQUAL** (was "Cefepime
  preferred, carbapenem reserve"). Carbapenem reserve text fixed: reserve for mutated
  AmpC resistant to Cefepime + ESBL producers (carbapenemase removed — clinically wrong).
  L3 `CaseCard` overrides the static answer when mutated.
- **Roster:** `starfish`→"Coral", `friendly_crab`→"Friendly Clam" (full text), `seahorse`
  removed and repurposed as a procedural reef decoration (appears growing/thriving).
- **Docs:** `docs/RULES.md` rewritten as a full review sheet covering rules + per-organism
  catch blurbs/teaching + shot pop-up feedback + mutation banners, each with ✎ Change lines.

## Previous work (2026-06-04) — RULES.md adjudication
Applied the clinician adjudications from `docs/RULES.md`. Commit `f834543`.

- **Removed TMP-SMX and Fluoroquinolones entirely.** Arsenal is now
  Ceftriaxone / Cefepime / Carbapenems (`src/data/weapons.js`).
- **Carbapenem stewardship rework** (`src/logic/weaponChoice.js`): carbapenem is now
  a *correct* ("acceptable") choice for **high-risk AmpC and mutated** organisms with
  reserve-it messaging; stays **reserve/incorrect** for low-risk.
- **Mutation simplified** (`src/logic/mutation.js`): `INEFFECTIVE_ON_MUTATED =

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
