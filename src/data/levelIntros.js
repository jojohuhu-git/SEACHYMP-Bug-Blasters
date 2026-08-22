/**
 * levelIntros.js — short, plain-English intro content shown before each level
 * starts (LevelIntro.jsx). Keep goal text to 1-2 sentences; controls apply to
 * keyboard (Mac/PC) and touch (phone/tablet) alike, so no OS-specific wording.
 */

export const LEVEL_INTROS = {
  1: {
    level: 1,
    title: "Level 1 — Identify",
    goal:
      "Swim the reef and find the SEACHYMP organisms — bacteria that can produce AmpC, an enzyme that fights off antibiotics. Leave harmless reef life alone.",
    exampleOrganismIds: ["citrobacter", "reef_clownfish"],
  },
  2: {
    level: 2,
    title: "Level 2 — Weapon Match",
    goal:
      "Catch each organism, then pick the right antibiotic. High-risk AmpC needs Cefepime, low-risk usually takes Ceftriaxone, and Carbapenems are reserved for special cases. Not an AmpC organism? Release it.",
    weaponTokens: ["blue-bubble-cannon", "purple-electric-harpoon", "golden-anchor-launcher"],
  },
  3: {
    level: 3,
    title: "Level 3 — Stewardship Challenge",
    goal:
      "Real clinical cases. The organism alone doesn't decide the antibiotic — infection type, source control, and treatment duration all matter.",
    weaponTokens: ["blue-bubble-cannon", "purple-electric-harpoon", "golden-anchor-launcher"],
  },
};

export default LEVEL_INTROS;
