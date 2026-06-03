/**
 * progression.js — Reef growth stages and badge definitions.
 *
 * reefStages: keyed by minimum identifiedCount required.
 * BADGES: earned flags default false; saved to localStorage via GameState.
 */

export const REEF_STAGES = [
  {
    id: "barren",
    label: "Barren Reef",
    minCount: 0,
    description: "The reef is bleached and empty. Time to restore it.",
    emoji: "🪨",
    color: "#d1d5db",
  },
  {
    id: "sprouting",
    label: "Sprouting Reef",
    minCount: 2,
    description: "Small polyps are beginning to form. Good stewardship is working.",
    emoji: "🌱",
    color: "#86efac",
  },
  {
    id: "growing",
    label: "Growing Reef",
    minCount: 5,
    description: "The reef is filling with color. Life is returning.",
    emoji: "🌿",
    color: "#4ade80",
  },
  {
    id: "thriving",
    label: "Thriving Reef",
    minCount: 8,
    description: "A vibrant reef ecosystem — teeming with life. Master steward!",
    emoji: "🪸",
    color: "#f472b6",
  },
];

export function getReefStage(identifiedCount) {
  const stages = [...REEF_STAGES].reverse();
  return stages.find((s) => identifiedCount >= s.minCount) || REEF_STAGES[0];
}

export const BADGES = [
  {
    id: "ampC_apprentice",
    name: "AmpC Apprentice",
    description: "Identified your first SEACHYMP organism.",
    emoji: "🏅",
    earned: false,
  },
  {
    id: "cefepime_commander",
    name: "Cefepime Commander",
    description: "Correctly recognized a high-risk AmpC organism.",
    emoji: "⚡",
    earned: false,
  },
  {
    id: "source_control_specialist",
    name: "Source Control Specialist",
    description: "Completed a clinical case involving source control.",
    emoji: "🎯",
    earned: false,
  },
  {
    id: "stewardship_sailor",
    name: "Stewardship Sailor",
    description: "Correctly ignored 3 non-SEACHYMP organisms.",
    emoji: "⚓",
    earned: false,
  },
  {
    id: "reef_protector",
    name: "Reef Protector",
    description: "Reached the Thriving Reef stage.",
    emoji: "🪸",
    earned: false,
  },
  {
    id: "master_seachymp",
    name: "Master of the SEACHYMP Seas",
    description: "Identified all 8 core SEACHYMP organisms and the bonus organism.",
    emoji: "🌊",
    earned: false,
  },
];

export default { REEF_STAGES, BADGES, getReefStage };
