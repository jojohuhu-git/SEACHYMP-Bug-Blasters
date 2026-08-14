# SEACHYMP: Bug Blasters — Handoff after the special-effects overhaul (2026-08-13)

**Repo:** `~/Downloads/SEACHYMP-Bug-Blasters` (the Desktop copy is one commit behind — do not
use it). **Live:** https://jojohuhu-git.github.io/SEACHYMP-Bug-Blasters/ — every push to
`main` auto-deploys via GitHub Actions.

**The app:** a calm, no-fail educational game teaching AmpC beta-lactamase stewardship.
Captain Chymp (a monkey in a diving helmet) nets sea creatures and treats them with one of
three antibiotics. The teaching axis is Cefepime (high-risk AmpC) vs Ceftriaxone (low-risk),
plus reserving carbapenems. Effects are not decoration — they are how the drug choice and
its consequences are made readable.

Branch: `main`, in sync with `origin/main` at commit `09497b8`. **Working tree is DIRTY —
7 modified files, ~973 insertions, nothing committed.** The owner explicitly asked that
everything stay uncommitted until all five items are done.

**There is no test suite in this repo** (`package.json` has only dev/build/lint/preview).
Verification is `npm run build` + `npm run lint` + driving the running app. As of this
handoff: **build clean, `ESLint: No issues found`, no browser console errors.**

## The five-item plan (owner-approved 2026-08-13)

The owner asked for two changes (a visible net throw, bigger/more colourful explosions),
then chose three more from a menu. They declined **sound effects** — do not add audio.
They chose to work **one item at a time with a check-in between each**.

## What's done — items 1–4 (all uncommitted)

1. **Net throw now reads as hold → wind-up → throw → drape.**
   `playerRenderer.js` — `drawNet` rebuilt into four phases over `NET_DUR = 1.5s`
   (was a 14-frame line-and-hoop flourish, ~0.23s, with nothing draping). Captain holds a
   gathered bundle, draws it back, throws it spinning open along an arc with the rope
   trailing, and it settles over the creature, sags and shakes as the creature struggles.
   New exports: `NET_POSE_MS`, `updatePoseTarget`. Level 1 previously did not use the
   shared pose at all and now does; all three levels hold their card back for the throw
   (`beginCapture` in each scene), and netted creatures are pinned via `org._netted` so the
   net stays on them. Verified: card appears at **1529 / 1531 / 1533 ms** in L1 / L2 / L3.

2. **Kill explosions much bigger and more colourful.**
   `organismSprites.js` `drawKillExplosion` — layered burst (hot core through the creature,
   3 coloured shockwaves reaching 5.5× radius, starburst spikes, 30 gravity-pulled debris
   shards, 18 sparks, 14 lingering embers, 16 bubbles) driven by a new `KILL_PALETTE`.
   Duration `0.03 → 0.018` per frame (~0.55s → ~0.9s) in `shotAnimation.js`.
   `screenEffects.js` kill preset: shake 8→**14**, 16→**24** frames, flash 0.3 white →
   **0.45 warm**.

3. **Each antibiotic has its own projectile and blast colour.**
   `shotAnimation.js` — replaced the single generic dot (its own `TODO`) with
   `SHOT_RENDERERS`: Ceftriaxone = wobbling bubble cluster (arcs **up**), Cefepime = barbed
   harpoon on a crackling tether (flies **flat**), Carbapenem = tumbling anchor dragging a
   chain (sags **down**), per `SHOT_ARC`. `createShot` gained `weaponId`.
   `organismSprites.js` gained `WEAPON_KILL_PALETTES` (blue / violet / gold); the scenes set
   `org.killWeaponId` on a kill so the blast takes the drug's colour.

4. **Mutation is now the game's biggest moment; wrong drugs visibly fizzle.**
   `shotAnimation.js` `drawOrganismEffects` — mutation rebuilt in three beats over ~0.85s
   (`0.045 → 0.02` per frame): pressure core + spreading red fissures → 3 shockwaves and
   embers → 7 dark-red armour plates locking in. `screenEffects.js` mutate preset raised to
   shake **18** / flash **0.55** plus a new **`screenWash`**: the water darkens red from the
   edges inward over 70 frames and recovers.
   The old grey pulse ring is replaced by a fizzle (`0.06 → 0.03` per frame): the dose
   splashes in the drug's own colour (`org.pulseColor`), stalls, dissolves into bubbles that
   drift up, a shimmer sweeps the creature, and the ring **collapses inward** instead of
   expanding.

**Bug found and fixed during item 4:** drawing the red mutation layers in additive
(`"lighter"`) mode turned the rings and embers **green** over Level 2's teal water. Those
layers now use normal blending; only the hot inner core is still additive. If you add more
red effects, do not use additive blending over the coloured oceans (L1 blue, L2 teal,
L3 violet).

## What's NOT done

**Item 5 — bring the ocean, the Captain and the reef to life. NOT STARTED.** Three parts:
- **Living ocean** in each scene's `drawOcean`: drifting plankton / marine snow, rippling
  light caustics, bubbles rising from the reef, an occasional fish shoal. Note each level
  has its own `drawOcean` with its own palette (L1 deep blue, L2 teal/emerald, L3 indigo
  violet) — this must be done for all three or explicitly scoped to one.
- **Captain motion**: `playerRenderer.js` draws a single fixed sprite that slides rigidly.
  Add a swim bob, a lean into the direction of travel, and a bubble stream.
- **Reef bloom**: the reef stage advances silently between frames
  (`reefStageIdx` / `reefRenderer.js`). Add a payoff when it advances — coral popping in,
  fish swimming through, light brightening.

All three must respect `prefersReducedMotion()`.

**Explicitly declined:** sound effects (offered, owner said no).

**Open question the owner never answered — ask, don't default:** is the 1.5s net throw the
right length? It is deliberately slow so the net is followable, but Level 1 has 13 creatures
per round, adding roughly 20 seconds to a full patrol. Offered alternative was 1.1s.
`NET_DUR` in `playerRenderer.js` is the single knob.

## Why this is a good stopping point

Items 1–4 are a coherent unit: everything that happens *when you act* (net, shot, kill,
mutation, wrong drug) has been reworked and verified together. Item 5 is purely ambient —
background, idle motion, and reward feedback — and touches different functions
(`drawOcean`, `drawPlayer`'s idle path, `reefRenderer`), so it blocks nothing and nothing
blocks it.

## Resuming

1. `cd ~/Downloads/SEACHYMP-Bug-Blasters` — you are on `main` with **uncommitted work**.
   Do not stash or reset it; items 1–4 live only in the working tree.
2. Confirm the baseline before touching anything: `npm run build` and `npm run lint` must
   both be clean (there is no test suite to run).
3. Start the dev server with `preview_start` (name `"SEACHYMP Bug Blasters dev server"`,
   port 5183) — never with Bash.
4. Ask the owner the open net-duration question above before starting item 5.
5. Build item 5 in one pass, then verify in the running app and report back — the owner
   reviews between items.
6. **Do not commit or push until item 5 is done and the owner approves.** The owner's
   standing instruction this session was to leave everything uncommitted until all five
   are complete. When it is time, follow the `ship` skill.

### Verifying canvas animations (technique worth reusing)

Round-trip latency makes it impossible to screenshot a sub-second canvas animation live.
What worked: temporarily freeze the animation at a chosen progress value (e.g.
`let QA_FREEZE = 0.3;` early-returning in `applyKillEffect`), then screenshot at leisure;
and magnify with a CSS transform on the canvas
(`cv.style.transform = 'translate(...) scale(3.5)'`), which does **not** resize the drawing
buffer and so does not reset the scene. Trigger captures by dispatching a grid of synthetic
clicks across the canvas. **Always grep for `TEMP for visual QA` before finishing** — every
such hack was removed and verified gone in this session.
