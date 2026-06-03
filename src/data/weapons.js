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
      "A medium-range launcher that fires friendly blue bubbles. Effective for low-risk AmpC organisms. Using this against high-risk AmpC organisms may select for resistance.",
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
      "A purple-glowing electric harpoon — more powerful than Ceftriaxone, with better stability against inducible AmpC. Preferred for Enterobacter, Citrobacter freundii, and K. aerogenes.",
  },
  {
    id: "carbapenem",
    name: "Carbapenems",
    nickname: "Golden Anchor Launcher",
    artToken: "golden-anchor-launcher",
    color: "#f59e0b",
    emoji: "⚓",
    cue: "Use only when truly needed.",
    appropriateFor: ["high", "low"],
    description:
      "A massive golden anchor launcher — the heaviest weapon in the arsenal. Reserve for confirmed resistance, ESBL/carbapenemase-producing organisms, or when all else fails. Good stewardship means using this sparingly.",
  },
  {
    id: "tmp_smx",
    name: "TMP-SMX",
    nickname: "Twin Torpedo Launcher",
    artToken: "twin-torpedo-launcher",
    color: "#10b981",
    emoji: "🟢",
    cue: "Useful for susceptible low-risk organisms.",
    appropriateFor: ["low"],
    description:
      "A twin green-and-yellow torpedo launcher — agile and precise. A useful oral option for susceptible organisms, including some SEACHYMP members when susceptibilities confirm it.",
  },
  {
    id: "fluoroquinolone",
    name: "Fluoroquinolones",
    nickname: "Trident Laser Rifle",
    artToken: "trident-laser-rifle",
    color: "#06b6d4",
    emoji: "🔱",
    cue: "Broad-spectrum — use judiciously.",
    appropriateFor: ["low"],
    description:
      "A sleek trident that fires fast laser beams — broad coverage but side effects matter. Often effective for Aeromonas and Yersinia; use judiciously to preserve utility.",
  },
];

export default WEAPONS;
