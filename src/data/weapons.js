/**
 * weapons.js — Antibiotic weapons used in Level 2+ gameplay.
 *
 * artToken: swap-able art reference. Placeholder uses emoji + color.
 * appropriateFor: which riskTier(s) this weapon is suited for.
 */

export const WEAPONS = [
  {
    id: "ceftriaxone",
    name: "Ceftriaxone",
    nickname: "Blue Bubble Cannon",
    artToken: "blue-bubble-cannon",
    color: "#4a90e2",
    emoji: "🔵",
    cue: "Good enough for many situations.",
    appropriateFor: ["low"],
    description:
      "A medium-range launcher that fires friendly blue bubbles. Effective for low-risk AmpC organisms. Using this agent against high-risk AmpC organisms, or prolonged courses for low-risk AmpC organisms, may select for resistance.",
  },
  {
    id: "cefepime",
    name: "Cefepime",
    nickname: "Purple Electric Harpoon",
    artToken: "purple-electric-harpoon",
    color: "#8b5cf6",
    emoji: "⚡",
    cue: "Preferred for higher-risk AmpC.",
    appropriateFor: ["high", "low"],
    description:
      "A purple-glowing electric harpoon — more powerful than Ceftriaxone, with better stability against inducible AmpC. Preferred for Enterobacter, Citrobacter freundii, Hafnia, Yersinia, and K. aerogenes. Also worth considering for a low-risk AmpC organism when a prolonged course of treatment is needed.",
  },
  {
    id: "carbapenem",
    name: "Carbapenems",
    nickname: "Golden Anchor Launcher",
    artToken: "golden-anchor-launcher",
    color: "#f59e0b",
    emoji: "⚓",
    cue: "Use only when truly needed.",
    appropriateFor: ["high"],
    description:
      "A massive golden anchor launcher — the heaviest weapon in the arsenal. Reserve for mutated AmpC organisms resistant to Cefepime, and for ESBL producers. Good stewardship means using this sparingly.",
  },
];

export default WEAPONS;
