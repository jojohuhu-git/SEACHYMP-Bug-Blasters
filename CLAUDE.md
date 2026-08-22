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
  HowToPlay, LevelIntro, Level1/2/3Scene, Encyclopedia, MyReef, WeaponsScreen, InGameMenu).
  `LevelIntro.jsx` (content in `src/data/levelIntros.js`) is a short goal + controls
  card shown before each level starts — reached from the Title screen, one per level.
- `src/components/` — InfoCard (capture decision card), HUD.
- `src/index.css` — CSS design tokens + global styles (edit here for palette).
- `App.jsx` — screen router / navigation state.
- `docs/RULES.md` — clinician-facing adjudication sheet: the code-accurate rule set
  with Approved?/Change columns. This is the workflow for rule changes (below).

## Vaccine/drug guidance priority
This is a stewardship teaching tool. Clinical rules should reflect **ACIP/IDSA/
guideline consensus**, not FDA package-insert minimums. When in doubt, prefer the
more current stewardship guidance and document the source in `docs/RULES.md`.

## Current rule set (as of 2026-08-22)
- **Arsenal:** Ceftriaxone, Cefepime, Carbapenems only. Carbapenem's `appropriateFor`
  in `weapons.js` is `["high"]` only (its Weapons-screen tag no longer shows LOW RISK —
  that tag contradicted the low-risk scoring rule below, where carbapenem is
  reserve/incorrect for low-risk).
- **Level 2 scoring (`classifyChoice`):**
  - Non-AmpC distractor → Release is correct; any antibiotic = overtreatment (wrong).
  - SEACHYMP organism + Release → wrong (needed treatment).
  - High-risk AmpC: Cefepime = preferred; Ceftriaxone = wrong; Carbapenem =
    **acceptable/correct** (with "reserve when possible" messaging).
  - Low-risk AmpC: Ceftriaxone = preferred; Cefepime = acceptable; Carbapenem =
    **reserve/incorrect**.
  - Mutated form (high-risk only): Ceftriaxone = ineffective/wrong; **Cefepime and
    Carbapenem are CO-EQUAL correct** (neither labeled "preferred"); mutated keeps
    `riskTier:"high"`. `classifyChoice` has explicit mutated branches for cefepime
    and carbapenem; `Level3Scene.CaseCard` overrides the static `correctDecision`
    so either is accepted when mutated.
  - Carbapenem reserve messaging (updated 2026-06-11): "reserve for mutated AmpC
    organisms resistant to Cefepime, and for ESBL producers." Do NOT cite
    carbapenemase producers as a reserve indication (carbapenems don't treat them).
- **Mutation:** triggered by 2 inappropriate Ceftriaxone calls on the SAME high-risk
  organism type (`MUTATION_THRESHOLD = 2`, lowered from 3 on 2026-08-22).
  `INEFFECTIVE_ON_MUTATED = ["ceftriaxone"]`. Only high-risk types mutate.
- **Level 3:** 17 cases, scored as exact match to `correctDecision`. Durations are
  display-only context (not scored). Added 2026-08-22: a Morganella diabetic-foot/
  osteomyelitis case (low-risk organism, prolonged 6-week course with no surgical
  source control → Cefepime), so there are now 2 low-risk-organism-prolonged-course
  cases where Cefepime beats Ceftriaxone (the other is the pre-existing Serratia
  endocarditis case). Both rationales now also mention a carbapenem as a reasonable
  reserve option when Cefepime isn't a good fit for the patient — text only, this
  does not change scoring (`correctDecision` is still `"cefepime"` for both).
- **Bonus organism:** still Klebsiella aerogenes (swap to Hafnia was considered and
  declined by the owner on 2026-08-22 — see `docs/RULES.md` Global notes for why).

## The rule-change workflow (`docs/RULES.md`)
1. `docs/RULES.md` mirrors what the code currently enforces **and the player-facing text**:
   the Level 1/2/3 rules + mutation, the **per-organism catch blurbs + teaching points**,
   and the **pop-up feedback** shown when a bug is shot (Level 2 `classifyChoice` strings,
   Level 3 case rationales, and the mutation banners).
2. A clinician fills the **Approved?** / **Change to / Notes** columns or the **✎ Change:**
   lines under each organism / feedback string.
3. Claude applies every edit in one pass across all surfaces, then re-verifies with
   `npm run build` + `npm run lint` + manual walkthrough, and redeploys.
4. Keep `docs/RULES.md` (header `Organisms:` / `Cases:` counts + "Last generated" date)
   in sync after changes. RULES.md is regenerated from current code — it is the review
   surface, not a historical log.

When changing a drug rule, update **every** surface that references it:
`weaponChoice.js`, `cases.js`, `weapons.js`, `mutation.js`, `organisms.js`
(encyclopedia text), the scene banners (`Level2Scene`, `Level3Scene`), `InfoCard`,
and `HowToPlay`. Then grep `src/` to confirm no stale drug references remain.

## Deploy
**Live on GitHub Pages:** https://jojohuhu-git.github.io/SEACHYMP-Bug-Blasters/
- Remote: `origin` → `github.com/jojohuhu-git/SEACHYMP-Bug-Blasters` (public).
- Every push to `main` triggers `.github/workflows/deploy.yml` (build →
  `actions/upload-pages-artifact` → `actions/deploy-pages`). Pages source =
  "GitHub Actions".
- `vite.config.js` sets `base: '/SEACHYMP-Bug-Blasters/'` — asset paths MUST stay
  under this subpath. If the repo is ever renamed, update `base` to match or the
  deployed assets 404.
- Local preview of the production build: `npm run build` + `npm run preview`.

## Known follow-ups
- README is partly stale (still says Level 2/3 are "deferred" and lists 5 weapons).
- Several organism **catch blurbs still describe the old placeholder creature**, not the
  new sprite art (flagged with ⚠ in `docs/RULES.md`). Rewrite via RULES.md when desired.

## Illustrated creature art (added 2026-06-11)

The placeholder colored-circles/monograms were replaced with illustrated sea-creature
sprites on **both** the canvas and the HTML surfaces.

### Assets
- `public/art/organisms/<artToken>.webp` — 22 transparent WebP sprites (cropped from the
  two `~/Desktop/sea creatures*.png` master sheets, white background flood-filled to
  transparent). Served from `/public` via `import.meta.env.BASE_URL` (Pages-subpath safe);
  not bundled into JS. Each organism's `artToken` in `organisms.js` = its sprite filename.
- `public/art/chymps/captain.webp` — Captain Chymp (unchanged).
- `comb-jelly.webp` is currently unused (was the removed seahorse's art).

### Canvas render seam
- `src/logic/organismSprites.js` — preloads/caches sprites; `drawCreatureSprite()` draws
  one centered/scaled to ~2.4× the organism radius (matches the old hit-test footprint).
  Also builds cached color-tinted silhouettes for effects, and exposes
  `drawKillExplosion()` and `prefersReducedMotion()`.
- `src/logic/organismRenderer.js` `drawOrganism()` now: (1) plays the sprite-based **kill
  explosion** when `org.fading`; (2) tries a registered `ART_REGISTRY[token]` renderer;
  (3) draws the **sprite** with mutation visuals; (4) falls back to the colored-circle
  placeholder until the WebP decodes.
- **Mutation visuals (procedural):** pulsing red glow halo + red tint overlay + shake +
  rising ember particles, all time-driven from a per-instance `org._mutSeed`. Reduced-motion
  drops shake/particles, keeps a static tint+glow.
- **Kill explosion (procedural):** white flash + debris shards (organism color) + rising
  bubbles + expanding ring + grow/fade of the sprite, driven by `org.fadeProgress`.
  Reduced-motion = plain shrink/fade.

### Reveal timing (important)
`Level2Scene`/`Level3Scene` defer the result card until the canvas effect finishes:
`applyAnimationOutcome` sets the effect + a `pendingRevealRef`; the loop reveals the
weapon-result card only once the kill/mutate/pulse completes. Without this, the result
card (an overlay) hides the explosion. Don't revert to immediate `setAnimatingShot(false)`.

### Captain poses (procedural overlays)
`src/logic/playerRenderer.js` `drawPlayer(ctx, chymp, x, y, facingRight, pose)` +
`triggerPose(state, kind, tx, ty)`. Two poses drawn over the fixed captain sprite:
- `"gun"` — antibiotic-gun barrel + muzzle flash aimed at the target + recoil kick.
  Triggered on `createShot` in L2/L3.
- `"net"` — thrown net (rope + expanding mesh ring) traveling to the target. Triggered on
  capture in L2/L3. (Level 1 keeps its own pre-existing `netAnim` flourish.)
Poses auto-expire (gun 0.35s, net 0.55s); `state.pose` is passed to `drawPlayer`.

### HTML surfaces
- `src/components/OrganismImage.jsx` — renders `art/organisms/<artToken>.webp` with the
  monogram square as `onError`/no-token fallback. Used by `InfoCard`, `Encyclopedia`,
  `Level2Scene` WeaponChoiceCard, and `Level3Scene` CaseCard (all flex-centered boxes).
- `src/art/ART_COMPONENTS.js` still has **no** organism entries (organism art is raster
  sprites via `OrganismImage`, not SVG components) — that's intentional.

### Reef
- `src/logic/reefRenderer.js` gained a procedural **seahorse** (`drawSeahorse`) that appears
  as decorative reef life once the reef is growing/thriving (`STAGE[].seahorses` = 0/0/1/3).
  The seahorse was removed as a clickable distractor organism and repurposed here.

### Organism roster notes (2026-06-11)
- Renamed (display name + species + blurb + teaching, ids kept for save-compat):
  `starfish` → **"Coral"**, `friendly_crab` → **"Friendly Clam"**.
- `seahorse` organism **removed** (now reef decoration). Distractor pools are computed
  dynamically, so counts adjust automatically (now 22 organisms, 13 distractors).
