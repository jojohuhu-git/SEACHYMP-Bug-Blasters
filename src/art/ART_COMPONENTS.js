/**
 * ART_COMPONENTS.js — Registry of token → React SVG component.
 *
 * Analogous to ART_REGISTRY in src/logic/organismRenderer.js (which maps
 * token → canvas draw function). This registry covers React / static screens.
 *
 * Tokens come from:
 *   - SQUAD[].id            (squad.js)
 *   - WEAPONS[].artToken    (weapons.js)
 *   - REEF_STAGES[].id      (progression.js)
 *   - BADGES[].id           (progression.js)
 *   - ORGANISMS[].artToken  (organisms.js) — Pass 2 creature portraits go here
 *
 * Pass 1 (chrome): chymps, weapons, reef stages, badges, title mascot. ✓
 * Pass 2 (AmpC creature portraits): stub comments below mark each slot.
 *
 * Each entry is a React component that accepts:
 *   { size: number }  — outer bounding dimension in px (width === height for square,
 *                        weapons use width with proportional height internally)
 * Additional props are ignored safely.
 */

// ── Chymp (Captain only — squad selection removed) ────────────────────────────
import CaptainChymp    from "./chymps/CaptainChymp.jsx";

// ── Weapons ──────────────────────────────────────────────────────────────────
import BlueBubbleCannon       from "./weapons/BlueBubbleCannon.jsx";
import PurpleElectricHarpoon  from "./weapons/PurpleElectricHarpoon.jsx";
import GoldenAnchorLauncher   from "./weapons/GoldenAnchorLauncher.jsx";

// ── Reef stages ───────────────────────────────────────────────────────────────
import { BarrenReef, SproutingReef, GrowingReef, ThrivingReef } from "./reef/ReefStages.jsx";

// ── Badges ────────────────────────────────────────────────────────────────────
import {
  AmpCApprenticeBadge,
  CefepimeCommanderBadge,
  SourceControlSpecialistBadge,
  StewardshipSailorBadge,
  ReefProtectorBadge,
  MasterSeachympBadge,
} from "./badges/Badges.jsx";

// ── Title mascot (special — not a data token, imported by TitleScreen directly) ──
export { default as TitleMascot } from "./TitleMascot.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// THE REGISTRY
// Keys match the token strings from data files exactly.
// ─────────────────────────────────────────────────────────────────────────────

export const ART_COMPONENTS = {
  // Chymp (SQUAD[].id)
  captain:  CaptainChymp,

  // Weapons (WEAPONS[].artToken)
  "blue-bubble-cannon":      BlueBubbleCannon,
  "purple-electric-harpoon": PurpleElectricHarpoon,
  "golden-anchor-launcher":  GoldenAnchorLauncher,

  // Reef stages (REEF_STAGES[].id)
  barren:    BarrenReef,
  sprouting: SproutingReef,
  growing:   GrowingReef,
  thriving:  ThrivingReef,

  // Badges (BADGES[].id)
  ampC_apprentice:           AmpCApprenticeBadge,
  cefepime_commander:        CefepimeCommanderBadge,
  source_control_specialist: SourceControlSpecialistBadge,
  stewardship_sailor:        StewardshipSailorBadge,
  reef_protector:            ReefProtectorBadge,
  master_seachymp:           MasterSeachympBadge,

  // ── Pass 2 AmpC creature portraits (not yet authored) ────────────────────
  // Token                  Design spec (motif from organisms.js + color)
  // "pirate-jellyfish"  → Serratia: rosy-pink jellyfish with pirate hat, #e85d8a
  // "armored-puffer-beast" → Enterobacter: dark-green armored puffer, #3a7a3a
  // "leech-slug-hybrid"    → Aeromonas: teal sea-slug with leech mouth, #7ab8b8
  // "armored-crab-tank"    → Citrobacter freundii: brown armored crab, #8b6914
  // "purple-blobfish"      → Hafnia: purple blobfish sad face, #9370db
  // "tiny-blue-hermit-crab"→ Yersinia: small blue hermit crab, #4a90d9
  // "sneaky-moray-eel"     → Morganella: olive-green moray eel, #5a8a3a
  // "pink-spiny-sea-cucumber"→ Providencia: pink spiny sea cucumber, #e87aaa
  // "spiked-lionfish"      → Klebsiella aerogenes: orange spiked lionfish, #e05a14
  // Non-AmpC distractors keep their monogram placeholder — no SVG needed.
};

export default ART_COMPONENTS;
