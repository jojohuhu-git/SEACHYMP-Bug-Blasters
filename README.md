# SEACHYMP Bug Blasters

**Master the Ocean of Antimicrobial Stewardship**

A calm, no-fail educational game for clinicians and learners. Swim through an ocean reef, identify AmpC-producing organisms, and learn the key rules of antibiotic stewardship. No timers, no penalties, no game-over.

---

## What the game is

SEACHYMP is a mnemonic for AmpC beta-lactamase–producing gram-negative bacteria:

**S**erratia · **E**nterobacter · **A**eromonas · **C**itrobacter · **H**afnia · **Y**ersinia · **M**organella · **P**rovidencia

The core teaching: not all SEACHYMP organisms carry the same risk. Enterobacter, Citrobacter, and Klebsiella aerogenes are HIGH-risk AmpC producers where Cefepime is preferred over 3rd-gen cephalosporins for serious infections.

---

## Running locally

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
```

---

## Folder structure

```
src/
  data/           ← All clinical/game content lives here (edit these for rules changes)
    organisms.js    SEACHYMP organisms + distractors (art tokens, risk tiers, blurbs)
    weapons.js      Antibiotic weapons (Level 2+)
    cases.js        Clinical cases (Level 3+)
    squad.js        5 cosmetic Chymp characters
    progression.js  Reef stages + badge definitions
  logic/          ← Shared game engine (not UI-specific)
    mutation.js     Mutation tracker (MutationTracker class)
    gameState.js    localStorage persistence helpers
  screens/        ← Full-screen React components (one per screen)
    TitleScreen     Title + main menu
    SquadSelect     Chymp character picker
    HowToPlay       Instructions + rules
    Level1Scene     Playable canvas scene (free-swim + capture)
    Encyclopedia    Collected organisms reference
    MyReef          Reef progress + badges
    WeaponsScreen   Antibiotic weapons reference
    InGameMenu      Pause menu (shown over Level 1)
  components/     ← Shared UI components
    InfoCard        Organism capture info card + identify/ignore decision
    HUD             In-game heads-up display
  index.css       CSS design tokens + global styles (edit here for palette changes)
  App.jsx         Screen router (all navigation state)
```

---

## Where to edit clinical content

All clinical and game content is in `src/data/`. The rule: **data drives everything, code touches nothing**. You can:

- Add/edit organisms: `src/data/organisms.js` — change `teachingPoint`, `blurb`, `riskTier`, `artToken`
- Add clinical cases: `src/data/cases.js` — add a new case object
- Edit antibiotic weapons: `src/data/weapons.js`
- Change reef stages or badges: `src/data/progression.js`

To swap in real art: set `artToken` on any organism/weapon, then update the rendering in `Level1Scene.jsx`'s `drawOrganism()` function. The rest of the game is untouched.

---

## What's in this slice vs deferred

### Functional in this slice
- Title screen, squad select, How to Play rules screen
- Level 1: playable canvas scene (free-swim, drifting organisms, capture, info cards)
- Mutation system (wired and demonstrable — mishandle a HIGH-risk organism 3x)
- Encyclopedia (shows collected organisms, persisted to localStorage)
- My Reef (reef growth stages + badges)
- Weapons reference screen (all 5 antibiotic weapons defined)
- localStorage persistence (chosen Chymp, encyclopedia, badges, progress)
- Keyboard + touch/mouse controls
- Responsive layout (works narrow)

### Deferred (data is defined, UI is stubbed)
- **Level 2: Weapon Match** — fire antibiotics at organisms; appropriateness scoring
- **Level 3: Clinical Cases** — case card UI (data in `src/data/cases.js`)
- **Sound** — hooks marked with `// TODO: sound` throughout
- **Real art** — placeholder emoji + colored circles; swap via `artToken`
- **Capacitor mobile packaging** — architecture is touch-ready; no Capacitor added yet
- **Multi-level progression** — Level 2 and 3 scene scaffolds not yet built

---

## Design principles

- **Data layer is source of truth**: all clinical content in `src/data/`, zero hardcoding in UI components
- **Art is swappable**: `artToken` string on each organism/weapon; rendering reads from it
- **Touch-first, keyboard also**: designed for Capacitor iOS/Android packaging later
- **No timers, no fail states**: calm learning game — every capture is a teaching moment
