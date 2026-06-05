# SEACHYMP: Bug Blasters

**Master the Ocean of Antimicrobial Stewardship**

A calm, no-fail educational game for clinicians and learners. Swim through an ocean reef, identify AmpC-producing organisms, choose the right antibiotic weapon, and work through clinical cases — all without timers or penalties.

---

## What the game teaches

SEACHYMP is a mnemonic for AmpC beta-lactamase–producing gram-negative bacteria:

**S**erratia · **E**nterobacter · **A**eromonas · **C**itrobacter · **H**afnia · **Y**ersinia · **M**organella · **P**rovidencia (+ Klebsiella aerogenes bonus)

The core teaching axis: **Cefepime (high-risk AmpC) vs Ceftriaxone (low-risk AmpC)**, plus stewardship around reserving carbapenems and not over-treating non-AmpC reef organisms.

Not all SEACHYMP organisms carry the same risk. Enterobacter, Citrobacter freundii, and Klebsiella aerogenes are HIGH-risk AmpC producers where Cefepime is preferred over 3rd-generation cephalosporins for serious infections.

### Mutation system
Calling Ceftriaxone inappropriately on the same high-risk organism type 3 times triggers a mutated form — the organism grows larger, turns red, and Ceftriaxone becomes ineffective against it. Switch to Cefepime or a carbapenem.

---

## Running locally

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
npm run lint     # ESLint
```

There is no test suite. Verify changes with `npm run build` + `npm run lint` + a manual click-through of Levels 1–3.

---

## The three levels

### Level 1 — Reef Patrol
Free-swim canvas scene. Organisms drift through the ocean; swim up to one and press Space/E or click to capture it. Decide: is this a SEACHYMP target (identify) or a non-AmpC organism (ignore/release)? Correct captures add organisms to your Encyclopedia and grow your reef.

### Level 2 — Weapon Match
The same ocean, now with your antibiotic arsenal. After capturing an organism, pick the right antibiotic. Appropriateness is scored by `src/logic/weaponChoice.js`. Inappropriate Ceftriaxone on a high-risk organism triggers the mutation animation and tracks toward the mutation threshold.

### Level 3 — Clinical Cases
Indigo-twilight ocean with 16 clinical cases drawn from `src/data/cases.js`. Each organism links to one or more real cases (infection type, source control context, planned duration). Choose the correct antibiotic for the specific clinical scenario. Completion requires resolving a case for every SEACHYMP type that has an associated case.

---

## Antibiotic arsenal (3 weapons)

| Weapon | In-game nickname | Appropriate for |
|---|---|---|
| **Ceftriaxone** | Blue Bubble Cannon | Low-risk AmpC organisms |
| **Cefepime** | Purple Electric Harpoon | High-risk AmpC (preferred); low-risk (acceptable) |
| **Carbapenems** | Golden Anchor Launcher | Reserve — confirmed resistance or ESBL/carbapenemase |

TMP-SMX and Fluoroquinolones were removed from the arsenal in 2026-06-04 to sharpen the teaching focus.

---

## Folder structure

```
src/
  data/           All clinical/game content lives here (edit here for rules changes)
    organisms.js    SEACHYMP organisms + distractors; riskTier, color, artToken, blurb
    weapons.js      3 antibiotic weapons (Ceftriaxone, Cefepime, Carbapenems)
    cases.js        16 clinical cases for Level 3
    squad.js        5 cosmetic Chymp characters (Captain, Scout, Professor, Deep Sea, Ranger)
    progression.js  Reef stages + badge definitions
  logic/          Shared game engine (not UI-specific)
    weaponChoice.js   classifyChoice(org, weaponId, mutated) — Level 2/3 scoring engine
    mutation.js       MutationTracker class + MUTATION_THRESHOLD + INEFFECTIVE_ON_MUTATED
    gameState.js      localStorage persistence helpers
    shotAnimation.js  Projectile animation helpers (used by Level 2 + 3)
  screens/        Full-screen React components (one per screen)
    TitleScreen       Title + main menu
    SquadSelect       Chymp character picker
    HowToPlay         Instructions + rules
    Level1Scene       Reef Patrol — free-swim + organism capture
    Level2Scene       Weapon Match — antibiotic selection + projectile animation
    Level3Scene       Clinical Cases — case cards + weapon scoring
    Encyclopedia      Collected organisms reference
    MyReef            Reef progress + badges
    WeaponsScreen     Antibiotic weapons reference
    InGameMenu        Pause menu (shown over any level)
  components/     Shared UI components
    InfoCard          Organism capture info card + identify/ignore decision (Level 1)
    HUD               In-game heads-up display
  index.css       CSS design tokens + global styles (edit here for palette changes)
  App.jsx         Screen router (all navigation state)
```

---

## Where to edit clinical content

All clinical and game content is in `src/data/`. The rule: **data drives everything, code touches nothing**. You can:

- Add/edit organisms: `src/data/organisms.js` — change `teachingPoint`, `blurb`, `riskTier`, `artToken`, `color`
- Add/edit clinical cases: `src/data/cases.js` — add a case object with `organismId`, `correctDecision`, `infection`, `sourceControl`, `duration`, `rationale`
- Edit antibiotic weapons: `src/data/weapons.js`
- Change reef stages or badges: `src/data/progression.js`
- Adjust scoring rules: `src/logic/weaponChoice.js`

To swap in real art: set `artToken` on any organism or weapon, then update the rendering in the Level scene's `drawOrganism()` function. The rest of the game is untouched.

When changing a drug rule, update every surface: `weaponChoice.js`, `cases.js`, `weapons.js`, `mutation.js`, and the scene banners in `Level2Scene.jsx`/`Level3Scene.jsx`. See `docs/RULES.md` for the full adjudication workflow.

---

## What's functional vs genuinely deferred

### Functional
- Title screen, squad select (5 Chymp characters), How to Play rules screen
- Level 1: playable canvas scene (free-swim, drifting organisms, capture, info cards)
- Level 2: Weapon Match — antibiotic selection, appropriateness scoring, projectile animation
- Level 3: Clinical Cases — 16 cases, scored against `correctDecision`, source-control badges
- Mutation system (wired and demonstrable — mishandle a HIGH-risk organism 3 times with Ceftriaxone)
- Encyclopedia (shows collected organisms, persisted to localStorage)
- My Reef (reef growth stages + badges)
- Weapons reference screen (3 antibiotic weapons)
- localStorage persistence (chosen Chymp, encyclopedia, badges, progress)
- Keyboard + touch/mouse controls
- Responsive layout

### Genuinely deferred
- **Sound** — hooks marked with `// TODO: sound` throughout
- **Real art** — placeholder colored circles + monograms; swap via `artToken`
- **Capacitor mobile packaging** — architecture is touch-ready; no Capacitor added yet

---

## Design principles

- **Data layer is source of truth**: all clinical content in `src/data/`, zero hardcoding in UI
- **Art is swappable**: `artToken` string on each organism/weapon; rendering reads from it
- **Touch-first, keyboard also**: designed for Capacitor iOS/Android packaging later
- **No timers, no fail states**: calm learning game — every encounter is a teaching moment
